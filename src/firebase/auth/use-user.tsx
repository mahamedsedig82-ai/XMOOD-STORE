'use client';

import { useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, firestore as db } from '../index';
import { UserProfile } from '@/app/lib/types';
import { syncUserProfile } from '@/lib/auth';

/**
 * 🛡️ Robust Auth State Hook
 * يضمن عزل الجلسات تماماً وتنظيف كافة المستمعات عند تسجيل الخروج لمنع تسرب الذاكرة.
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const unsubscribeProfileRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // 1. تنظيف أي مستمع قديم فوراً
      if (unsubscribeProfileRef.current) {
        unsubscribeProfileRef.current();
        unsubscribeProfileRef.current = null;
      }

      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else {
        setUser(firebaseUser);
        
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // 2. بدء مستمع البروفايل مع معالجة الأخطاء
        unsubscribeProfileRef.current = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            setProfile({ ...snapshot.data(), uid: snapshot.id } as UserProfile);
            setLoading(false);
          } else {
            // مزامنة أولية للحسابات الجديدة
            syncUserProfile(firebaseUser).finally(() => setLoading(false));
          }
        }, (err) => {
          console.error("[AUTH_GUARD] Profile Access Restricted:", err);
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
