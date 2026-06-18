'use client';

import { useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, firestore as db } from '../index';
import { UserProfile } from '@/app/lib/types';
import { syncUserProfile } from '@/lib/auth';

/**
 * 🛡️ Sovereign Identity Manager 26.0 (Atomic Sync)
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

      // 2. Set user and start profile sync
      setUser(firebaseUser);
      setLoading(true);

      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
      }

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      
      // Establish real-time profile listener
      profileUnsubscribeRef.current = onSnapshot(userDocRef, (snapshot) => {
        if (!auth.currentUser) return;

        if (snapshot.exists()) {
          setProfile({ ...snapshot.data(), uid: snapshot.id } as UserProfile);
          setLoading(false);
          setAuthSettled(true);
        } else {
          // If profile missing, trigger idempotent sync
          // snapshot will refire once created
          syncUserProfile(firebaseUser);
        }
      }, (err) => {
        console.warn("[IDENTITY_SYNC] Profile stream error:", err.message);
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
