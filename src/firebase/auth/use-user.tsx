'use client';

import { useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, firestore as db } from '../index';
import { UserProfile } from '@/app/lib/types';
import { syncUserProfile } from '@/lib/auth';

/**
 * 🛡️ خطاف المستخدم المحصن (Production Ready)
 * يضمن عدم نداء Firestore قبل جاهزية الـ Auth ويقوم بتنظيف المستمعات بدقة.
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubscribeProfileRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!auth) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      // تنظيف المستمع القديم عند تغيير حالة المستخدم
      if (unsubscribeProfileRef.current) {
        unsubscribeProfileRef.current();
        unsubscribeProfileRef.current = null;
      }

      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      } else {
        // تشغيل مستمع البروفايل فقط عند توفر المستخدم
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeProfileRef.current = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            setProfile({ ...snapshot.data(), uid: snapshot.id } as UserProfile);
            setLoading(false);
          } else {
            // مزامنة أولية إذا لم يكن الحساب موجوداً في Firestore
            syncUserProfile(firebaseUser).catch(() => setLoading(false));
          }
        }, (err) => {
          console.error("Profile Listener Access Denied", err);
          setLoading(false);
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfileRef.current) unsubscribeProfileRef.current();
    };
  }, []);

  const isAdmin = !!(user && profile && ['owner', 'admin', 'gm'].includes(profile.role));
  
  return { 
    user, 
    profile, 
    loading: loading || (!!user && !profile),
    isVerified: user?.emailVerified || false,
    isAdmin
  };
}
