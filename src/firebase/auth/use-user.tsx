'use client';

import { useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, firestore as db } from '../index';
import { UserProfile } from '@/app/lib/types';
import { syncUserProfile } from '@/lib/auth';

/**
 * 🛡️ Sovereign Identity Manager 27.0 (Atomic Sync & Self-Healing)
 * Orchestrates Auth and Firestore profile loading in a strict sequence.
 * Features:
 * 1. Wait for Auth State.
 * 2. If Auth exists, wait for Firestore Profile.
 * 3. If Profile missing, trigger silent self-healing (Sync).
 * 4. Ensure 'loading' only resolves when session is fully usable.
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
      
      // Establish real-time profile listener with self-healing
      profileUnsubscribeRef.current = onSnapshot(userDocRef, (snapshot) => {
        // Prevent processing if auth changed during snapshot
        if (auth.currentUser?.uid !== firebaseUser.uid) return;

        if (snapshot.exists()) {
          const profileData = snapshot.data();
          setProfile({ ...profileData, uid: snapshot.id } as UserProfile);
          setLoading(false);
          setAuthSettled(true);
        } else {
          // 🛡️ SELF-HEALING: If user is authenticated but profile is missing, recreate it.
          console.warn("[IDENTITY_SYNC] Missing profile detected. Reconstructing...");
          syncUserProfile(firebaseUser).catch(err => {
            console.error("[IDENTITY_SYNC] Reconstruction failed:", err);
            setLoading(false);
            setAuthSettled(true);
          });
        }
      }, (err) => {
        console.warn("[IDENTITY_SYNC] Profile stream error:", err.message);
        // Fallback to minimal profile if listener fails (permission issue etc)
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

  const isAdmin = !!(user && profile && ['owner', 'admin', 'gm', 'store_manager'].includes(profile.role));
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
