'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/app/lib/types';

export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Optimized Admin Check - MASTER EMAILS
  const MASTER_ADMINS = [
    "MAHAMEDFK3@GMAIL.COM", 
    "XMOODSTORE.SUPPORT@GMAIL.COM",
    "ADMIN@XMOOD.COM"
  ];

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
    if (!user || !db) {
      if (!user) setLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    let unsubscribeProfile: () => void;

    const syncProfile = async () => {
      try {
        const isMaster = MASTER_ADMINS.includes(user.email?.toUpperCase() || "");
        const docSnap = await getDoc(userDocRef);
        
        if (!docSnap.exists()) {
          const initialProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || "عضو معتمد",
            fullName: user.displayName || "",
            email: user.email || "",
            walletBalance: isMaster ? 999999 : 0,
            role: isMaster ? 'owner' : 'user',
            label: isMaster ? 'المدير العام للمنصة' : 'عضو بريميوم',
            photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
            createdAt: new Date().toISOString(),
            isVerified: user.emailVerified,
            affinityPoints: isMaster ? 1000 : 50
          };
          await setDoc(userDocRef, initialProfile);
          setProfile(initialProfile);
        } else {
          const currentData = docSnap.data() as UserProfile;
          // Forced check for Master Admin status to prevent accidental lockout
          if (isMaster && currentData.role !== 'owner') {
            await updateDoc(userDocRef, { 
              role: 'owner', 
              label: 'المدير العام للمنصة',
              isVerified: true 
            });
            setProfile({ ...currentData, role: 'owner', uid: user.uid });
          } else {
            setProfile({ ...currentData, uid: user.uid });
          }
        }

        // Setup real-time listener for profile updates
        unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as UserProfile;
            setProfile({ ...data, uid: snapshot.id });
          }
        }, (err) => {
          console.error("Real-time Profile Error:", err);
        });

      } catch (err) {
        console.error("Profile Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };

    syncProfile();

    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [user, db]);

  return { 
    user, 
    profile, 
    loading, 
    isVerified: user?.emailVerified || false,
    isAdmin: ['owner', 'admin', 'gm', 'store_manager', 'design_manager', 'designer', 'accountant', 'support', 'middleman', 'agent'].includes(profile?.role || '')
  };
}