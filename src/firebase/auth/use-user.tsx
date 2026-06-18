'use client';

import { useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, firestore as db } from '../index';
import { UserProfile } from '@/app/lib/types';
import { syncUserProfile } from '@/lib/auth';

/**
 * 🛡️ Sovereign Identity Manager 23.0 (Atomic Sync)
 * Orchestrates Auth and Firestore profile loading in a strict sequence.
 * Ensures 'loading' only resolves when BOTH auth and profile are ready.
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
      // 1. Clear profile listener if user logs out
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

      // 2. Set user and begin profile stabilization
      setUser(firebaseUser);
      setLoading(true);

      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
      }

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      
      profileUnsubscribeRef.current = onSnapshot(userDocRef, (snapshot) => {
        if (!auth.currentUser) return; // Prevent state update after logout

        if (snapshot.exists()) {
          setProfile({ ...snapshot.data(), uid: snapshot.id } as UserProfile);
          // 🛡️ LOADING RESOLVED: Data is fully confirmed in Firestore
          setLoading(false);
          setAuthSettled(true);
        } else {
          // Idempotent sync: create if missing. 
          // We DON'T set loading=false here; we wait for the next snapshot trigger.
          syncUserProfile(firebaseUser).catch(() => {
            // Fallback if sync fails to prevent permanent loading screen
            setLoading(false);
            setAuthSettled(true);
          });
        }
      }, (err) => {
        console.warn("[IDENTITY_SYNC] Connection error:", err.message);
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

  const isAdmin = !!(user && profile && ['owner', 'admin', 'gm'].includes(profile.role));
  const isVerified = user?.emailVerified || false;
  
  return { 
    user, 
    profile, 
    loading, // Combined state: true until auth + profile are confirmed
    isVerified,
    isAdmin,
    authSettled
  };
}
