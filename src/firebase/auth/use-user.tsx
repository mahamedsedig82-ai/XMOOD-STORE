'use client';

import { useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, firestore as db } from '../index';
import { UserProfile } from '@/app/lib/types';
import { syncUserProfile } from '@/lib/auth';

/**
 * 🛡️ Centralized Sovereign Identity Manager 20.0
 * Prevents overlapping listeners and Firestore assertions using Ref-Shielded logic.
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
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthSettled(true);
      
      // Cleanup previous profile listener immediately
      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
        profileUnsubscribeRef.current = null;
      }

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          profileUnsubscribeRef.current = onSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists()) {
              setProfile({ ...snapshot.data(), uid: snapshot.id } as UserProfile);
              setLoading(false);
            } else {
              // Initial sync if profile missing
              syncUserProfile(firebaseUser).catch(() => setLoading(false));
            }
          }, (err) => {
            console.warn("[IDENTITY_GUARD] Profile Sync Interrupted:", err.message);
            setLoading(false);
          });
        } catch (e) {
          console.error("[IDENTITY_GUARD] Fatal Sync Error", e);
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
        profileUnsubscribeRef.current = null;
      }
    };
  }, []);

  const isAdmin = !!(user && profile && ['owner', 'admin', 'gm'].includes(profile.role));
  
  return { 
    user, 
    profile, 
    loading: loading || !authSettled || (!!user && !profile), 
    isVerified: user?.emailVerified || false,
    isAdmin,
    authSettled
  };
}
