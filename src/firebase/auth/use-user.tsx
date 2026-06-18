'use client';

import { useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, firestore as db } from '../index';
import { UserProfile } from '@/app/lib/types';
import { syncUserProfile } from '@/lib/auth';

/**
 * 🛡️ Sovereign Identity Manager 21.0 (State Orchestrator)
 * Orchestrates Auth and Profile states with strict lifecycle management.
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authSettled, setAuthSettled] = useState(false);
  
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setAuthSettled(true);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // 1. Clear previous profile listener instantly to avoid collisions
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          unsubscribeRef.current = onSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists()) {
              setProfile({ ...snapshot.data(), uid: snapshot.id } as UserProfile);
              setLoading(false);
              setAuthSettled(true);
            } else {
              // Idempotent sync if profile doesn't exist
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
      } else {
        setProfile(null);
        setLoading(false);
        setAuthSettled(true);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
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
