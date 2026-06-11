
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
            displayName: user.displayName || 'مستخدم جديد',
            email: user.email || '',
            walletBalance: isAdmin ? 1000000 : 0,
            role: isAdmin ? 'admin' : 'user',
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, newProfile, { merge: true });
        } else if (isAdmin && docSnap.data()?.role !== 'admin') {
          // Force admin role if it's the specific email
          await setDoc(userDocRef, { role: 'admin', walletBalance: 1000000 }, { merge: true });
        }
      } catch (err) {
        // Handle error
      }
    };

    syncProfile();

    const unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      }
      setLoading(false);
    }, (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'get'
      }));
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user, db]);

  return { user, profile, loading };
}
