'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/app/lib/types';

export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAILS = ["MAHAMEDFK3@GMAIL.COM"];

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

    const syncProfile = async () => {
      try {
        const docSnap = await getDoc(userDocRef);
        const isAdmin = ADMIN_EMAILS.includes(user.email?.toUpperCase() || "");
        const isVerified = user.emailVerified;
        
        if (!docSnap.exists()) {
          const initialProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || "عضو جديد",
            fullName: user.displayName || "",
            email: user.email || "",
            walletBalance: isAdmin ? 999999 : 0,
            role: isAdmin ? 'owner' : 'user',
            label: isAdmin ? 'المدير العام للمتجر' : 'عضو بريميوم',
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString(),
            isVerified: isVerified,
            affinityPoints: isAdmin ? 1000 : 50
          };
          await setDoc(userDocRef, initialProfile);
          setProfile(initialProfile);
        } else {
          const currentData = docSnap.data();
          // Auto-upgrade role if email is in admin list
          if (isAdmin && currentData.role !== 'owner') {
            await setDoc(userDocRef, { 
              role: 'owner', 
              label: 'المدير العام للمتجر',
              isVerified: true 
            }, { merge: true });
          }
          // Sync verification status
          if (currentData.isVerified !== isVerified) {
            await setDoc(userDocRef, { isVerified }, { merge: true });
          }
        }
      } catch (err) {
        console.error("Profile Sync Error:", err);
      }
    };

    syncProfile();

    const unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      }
      setLoading(false);
    }, (error) => {
      console.error("Profile Listener Error:", error);
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user, db]);

  return { 
    user, 
    profile, 
    loading, 
    isVerified: user?.emailVerified || false 
  };
}