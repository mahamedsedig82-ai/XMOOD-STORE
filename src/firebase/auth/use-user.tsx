
'use client';

import { useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/app/lib/types';

/**
 * Sovereign hook for Identity & Role Management.
 * Optimized to prevent race conditions during Login phase.
 */
export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const syncInProgress = useRef(false);

  const MASTER_ADMINS = [
    "MAHAMEDFK3@GMAIL.COM", 
    "XMOODSTORE.SUPPORT@GMAIL.COM",
    "ADMIN@XMOOD.COM"
  ];

  const staffRoles = [
    'owner', 'admin', 'gm', 'community_admin', 'community_mod', 
    'store_manager', 'design_manager', 'designer', 'accountant', 
    'support', 'middleman', 'agent'
  ];

  useEffect(() => {
    if (!auth) return;
    
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        syncInProgress.current = false;
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!user || !db) return;

    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    let isMounted = true;

    const unsubscribeProfile = onSnapshot(userDocRef, async (snapshot) => {
      if (!isMounted) return;

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        
        // Forced Sovereign Sync for Masters
        const isMaster = MASTER_ADMINS.includes(user.email?.toUpperCase() || "");
        if (isMaster && data.role !== 'owner') {
          updateDoc(userDocRef, { role: 'owner', label: 'المدير العام', updatedAt: serverTimestamp() });
        }

        setProfile({ ...data, uid: snapshot.id });
        setLoading(false); 
      } else {
        // Safe Auto-Creation Logic
        // We avoid auto-create on login page if handleGoogleLogin is doing it
        if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
           console.log("[AUTH-DEBUG] useUser waiting for manual profile creation on login page.");
           return;
        }

        if (syncInProgress.current) return;
        syncInProgress.current = true;

        const isMaster = MASTER_ADMINS.includes(user.email?.toUpperCase() || "");
        const initialProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || "عضو",
          fullName: user.displayName || "",
          email: user.email || "",
          walletBalance: isMaster ? 999999 : 0,
          role: isMaster ? 'owner' : 'user',
          label: isMaster ? 'المدير العام' : 'عضو بريميوم',
          photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
          createdAt: new Date().toISOString(),
          isVerified: user.emailVerified,
          affinityPoints: isMaster ? 1000 : 50
        };

        try {
          await setDoc(userDocRef, { ...initialProfile, updatedAt: serverTimestamp() }, { merge: true });
          if (isMounted) {
            setProfile(initialProfile);
            setLoading(false);
          }
        } catch (e) {
          console.error("Auto-Profile creation failed:", e);
        } finally {
          syncInProgress.current = false;
        }
      }
    }, (err) => {
      console.error("Profile Sync Error:", err);
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribeProfile();
    };
  }, [user, db]);

  const isStaff = !!(user && (
    MASTER_ADMINS.includes(user.email?.toUpperCase() || "") || 
    (profile?.role && staffRoles.includes(profile.role))
  ));
  
  return { 
    user, 
    profile, 
    loading: loading || (!!user && !profile),
    isVerified: user?.emailVerified || false,
    isAdmin: isStaff,
    role: profile?.role
  };
}
