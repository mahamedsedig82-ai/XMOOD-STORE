'use client';

import { useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, firestore as db } from '../index';
import { UserProfile } from '@/app/lib/types';
import { syncUserProfile } from '@/lib/auth';

/**
 * 🛡️ Sovereign Identity Manager 42.0 (Role-Enhanced)
 * Orchestrates Auth and Firestore profile loading with expanded admin roles.
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authSettled, setAuthSettled] = useState(false);
  
  const profileUnsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setAuthSettled(true);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        if (profileUnsubscribeRef.current) {
          profileUnsubscribeRef.current();
          profileUnsubscribeRef.current = null;
        }
        setUser(null);
        setProfile(null);
        setLoading(false);
        setAuthSettled(true);
        return;
      }

      setUser(firebaseUser);
      setLoading(true);

      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
      }

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      
      profileUnsubscribeRef.current = onSnapshot(userDocRef, (snapshot) => {
        if (auth.currentUser?.uid !== firebaseUser.uid) return;

        if (snapshot.exists()) {
          const profileData = snapshot.data();
          setProfile({ ...profileData, uid: snapshot.id } as UserProfile);
          setLoading(false);
          setAuthSettled(true);
        } else {
          syncUserProfile(firebaseUser).catch(err => {
            console.error("[IDENTITY_SYNC] Reconstruction failed:", err);
            setLoading(false);
            setAuthSettled(true);
          });
        }
      }, (err) => {
        setLoading(false);
        setAuthSettled(true);
      });
    });

    return () => {
      unsubscribeAuth();
      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
        profileUnsubscribeRef.current = null;
      }
    };
  }, []);

  // 🛡️ Expanded isAdmin to include Designer roles for their specific dashboard access
  const isAdmin = !!(user && profile && ['owner', 'admin', 'gm', 'store_manager', 'designer', 'design_manager'].includes(profile.role));
  const isVerified = user?.emailVerified || profile?.isVerified || false;
  
  return { 
    user, 
    profile, 
    loading, 
    isVerified,
    isAdmin,
    authSettled
  };
}
