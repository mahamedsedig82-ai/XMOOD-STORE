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

    // دالة تهيئة الملف الشخصي بشكل آمن
    const syncProfile = async () => {
      try {
        const docSnap = await getDoc(userDocRef);
        if (!docSnap.exists()) {
          const newProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || 'مستخدم جديد',
            email: user.email || '',
            walletBalance: 0,
            role: 'user',
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString(),
          };
          // استخدام { merge: true } لضمان عدم مسح البيانات إذا وجدت
          await setDoc(userDocRef, newProfile, { merge: true });
        }
      } catch (err) {
        console.error("خطأ في مزامنة الملف الشخصي:", err);
      }
    };

    syncProfile();

    const unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      } else {
        // في حالة عدم وجود الوثيقة بعد، ننتظر قليلًا أو نعتمد على البيانات الأولية
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
