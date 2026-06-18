'use client';

import { useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/app/lib/types';
import { syncUserProfile } from '@/lib/auth';

export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  // 1. Monitor Auth State
  useEffect(() => {
    isMounted.current = true;
    if (!auth) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!isMounted.current) return;
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted.current = false;
      unsubscribeAuth();
    };
  }, [auth]);

  // 2. Monitor Profile Data from Firestore
  useEffect(() => {
    if (!user || !db) return;

    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);

    const unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
      if (!isMounted.current) return;

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        setProfile({ ...data, uid: snapshot.id });
        setLoading(false);
      } else {
        // If profile doesn't exist yet, sync it
        syncUserProfile(user).catch(() => {
          if (isMounted.current) setLoading(false);
        });
      }
    }, (error) => {
      console.error("Firestore Profile Listener Error:", error);
      if (isMounted.current) setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user, db]);

  const isAdmin = !!(user && ['owner', 'admin', 'gm'].includes(profile?.role || ''));
  
  return { 
    user, 
    profile, 
    loading: loading || (!!user && !profile),
    isVerified: user?.emailVerified || false,
    isAdmin
  };
}
