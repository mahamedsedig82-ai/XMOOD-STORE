'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/app/lib/types';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = "MAHAMEDFK3@GMAIL.COM";

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
        const isAdmin = user.email?.toUpperCase() === ADMIN_EMAIL.toUpperCase();
        
        if (!docSnap.exists()) {
          const newProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || 'مستخدم XMOOD',
            email: user.email || '',
            walletBalance: isAdmin ? 999999999 : 0,
            role: isAdmin ? 'admin' : 'user',
            label: isAdmin ? 'المدير العام للمنصة' : 'عضو XMOOD',
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, newProfile);
        } else if (isAdmin) {
          if (docSnap.data()?.role !== 'admin' || (docSnap.data()?.walletBalance || 0) < 100000000) {
            await setDoc(userDocRef, { 
              role: 'admin', 
              walletBalance: 999999999,
              label: 'المدير العام للمنصة'
            }, { merge: true });
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
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user, db]);

  return { user, profile, loading };
}
