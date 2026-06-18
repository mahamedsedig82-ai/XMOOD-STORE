'use client';

import { useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, firestore as db } from '../index';
import { UserProfile } from '@/app/lib/types';
import { syncUserProfile } from '@/lib/auth';

/**
 * 🛡️ Clean Auth State Hook
 * يضمن عزل الجلسات تماماً وتنظيف كافة المستمعات عند تسجيل الخروج.
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // مرجع لتتبع مستمع البروفايل لضمان تنظيفه
  const unsubscribeProfileRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!auth) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // 1. تنظيف أي مستمع قديم فوراً عند تغيير حالة المستخدم
      if (unsubscribeProfileRef.current) {
        unsubscribeProfileRef.current();
        unsubscribeProfileRef.current = null;
      }

      if (!firebaseUser) {
        // 2. مسح الحالة تماماً عند الخروج (Isolation)
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else {
        // 3. تحديث المستخدم والبدء في جلب البروفايل الطازج
        setUser(firebaseUser);
        
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        unsubscribeProfileRef.current = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            setProfile({ ...snapshot.data(), uid: snapshot.id } as UserProfile);
            setLoading(false);
          } else {
            // مزامنة أولية إذا كان الحساب جديداً
            syncUserProfile(firebaseUser).catch(() => setLoading(false));
          }
        }, (err) => {
          console.error("[AUTH_GUARD] Profile Access Denied", err);
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
