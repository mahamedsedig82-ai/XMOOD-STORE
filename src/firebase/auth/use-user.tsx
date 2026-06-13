
'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/app/lib/types';

/**
 * Enterprise-level User Hook with Role-Based Access Control (RBAC) synchronization.
 * High-performance profile monitoring and admin auto-detection.
 */
export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // High-level owners list (Enterprise Protection)
  const MASTER_ADMINS = ["MAHAMEDFK3@GMAIL.COM", "XMOODSTORE.SUPPORT@GMAIL.COM"];

  useEffect(() => {
    if (!auth) return;
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!user || !db) return;

    const userDocRef = doc(db, 'users', user.uid);

    const initializeProfile = async () => {
      try {
        const docSnap = await getDoc(userDocRef);
        const isMaster = MASTER_ADMINS.includes(user.email?.toUpperCase() || "");
        const isVerified = user.emailVerified;
        
        if (!docSnap.exists()) {
          // New User Provisioning
          const initialProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || "Sovereign Member",
            fullName: user.displayName || "",
            email: user.email || "",
            walletBalance: isMaster ? 999999 : 0,
            role: isMaster ? 'owner' : 'user',
            label: isMaster ? 'المالك السيادي للمنصة' : 'عضو بريميوم',
            photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
            createdAt: new Date().toISOString(),
            isVerified: isVerified,
            affinityPoints: isMaster ? 1000 : 50
          };
          await setDoc(userDocRef, initialProfile);
          setProfile(initialProfile);
        } else {
          const currentData = docSnap.data();
          // Auto-escalate permissions if email matches master list
          if (isMaster && currentData.role !== 'owner') {
            await setDoc(userDocRef, { 
              role: 'owner', 
              label: 'المالك السيادي للمنصة',
              isVerified: true 
            }, { merge: true });
          }
          // Sync live verification status from Firebase Auth to Profile
          if (currentData.isVerified !== isVerified) {
            await setDoc(userDocRef, { isVerified }, { merge: true });
          }
        }
      } catch (err) {
        console.error("Critical Profile Sync Failure:", err);
      }
    };

    initializeProfile();

    // Setup real-time listener for profile changes (Wallet, Role, Stats)
    const unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      }
      setLoading(false);
    }, (error) => {
      console.error("Profile Live Listener Error:", error);
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user, db]);

  return { 
    user, 
    profile, 
    loading, 
    isVerified: user?.emailVerified || false,
    isAdmin: ['owner', 'admin', 'gm'].includes(profile?.role || '')
  };
}
