'use client';

import { useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, firestore as db } from '../index';
import { UserProfile } from '@/app/lib/types';
import { syncUserProfile } from '@/lib/auth';

/**
 * 🛡️ Centralized Sovereign Identity Hook 8.0
 * نظام إدارة هوية مركزي يمنع تداخل المستمعات ويقضي على أخطاء Firestore Assertion.
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // مرجع ثابت لضمان وجود مستمع واحد فقط للملف الشخصي في أي وقت
  const profileUnsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    // 1. مراقبة حالة المصادقة المركزية
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      // إغلاق أي مستمع بروفايل قديم فوراً عند تغير حالة المستخدم
      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
        profileUnsubscribeRef.current = null;
      }

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          // تفعيل مستمع البروفايل بضمانات التنظيف
          profileUnsubscribeRef.current = onSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists()) {
              setProfile({ ...snapshot.data(), uid: snapshot.id } as UserProfile);
              setLoading(false);
            } else {
              // إذا لم يوجد الملف، نقوم بمزامنة أولية
              syncUserProfile(firebaseUser).catch(() => setLoading(false));
            }
          }, (err) => {
            console.warn("[AUTH_SYNC] Profile Listener Guarded:", err.message);
            setLoading(false);
          });
        } catch (e) {
          console.error("[AUTH_SYNC] Critical Initialization Error");
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // تنظيف نهائي عند مغادرة التطبيق بالكامل
    return () => {
      unsubscribeAuth();
      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
      }
    };
  }, []);

  const isAdmin = !!(user && profile && ['owner', 'admin', 'gm'].includes(profile.role));
  
  return { 
    user, 
    profile, 
    loading: loading || (!!user && !profile), // منع حالة "شبه الجاهزية"
    isVerified: user?.emailVerified || false,
    isAdmin
  };
}
