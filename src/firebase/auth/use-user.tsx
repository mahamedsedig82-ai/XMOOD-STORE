'use client';

import { useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, firestore as db } from '../index';
import { UserProfile } from '@/app/lib/types';
import { syncUserProfile } from '@/lib/auth';

/**
 * 🛡️ Sovereign Identity Manager 22.0 (Strict Lifecycle Orchestrator)
 * Manages Auth and Profile state with absolute synchronization and cleanup.
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authSettled, setAuthSettled] = useState(false);
  
  // Strict physical reference to profile listener for immediate kill on logout
  const profileUnsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setAuthSettled(true);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // 1. Critical Sequence: If user becomes null, KILL profile listener IMMEDIATELY
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

      // 2. If user exists, update state and start/restart profile listener
      setUser(firebaseUser);

      // Kill any previous profile listener before starting a new one for a new user
      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
      }

      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        profileUnsubscribeRef.current = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            setProfile({ ...snapshot.data(), uid: snapshot.id } as UserProfile);
            setLoading(false);
            setAuthSettled(true);
          } else {
            // Idempotent sync to create profile if missing
            syncUserProfile(firebaseUser).catch(() => {
              setLoading(false);
              setAuthSettled(true);
            });
          }
        }, (err) => {
          console.warn("[IDENTITY_GUARD] Firestore connection interrupted:", err.message);
          setLoading(false);
          setAuthSettled(true);
        });
      } catch (e) {
        setLoading(false);
        setAuthSettled(true);
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
  const isVerified = user?.emailVerified || false;
  
  return { 
    user, 
    profile, 
    loading: loading || !authSettled, 
    isVerified,
    isAdmin,
    authSettled
  };
}
