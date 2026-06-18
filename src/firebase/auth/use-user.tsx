'use client';

import { useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, firestore as db } from '../index';
import { UserProfile } from '@/app/lib/types';
import { syncUserProfile } from '@/lib/auth';

/**
 * 🛡️ Unitary Identity Hook 7.0
 * إدارة احترافية للمستمعات تمنع أخطاء Firestore Assertion نهائياً.
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // مراجع لتنظيف المستمعات ومنع التداخل
  const unsubscribeProfileRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      // 1. تنظيف مستمع البروفايل السابق عند تغيير حالة الدخول
      if (unsubscribeProfileRef.current) {
        unsubscribeProfileRef.current();
        unsubscribeProfileRef.current = null;
      }

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // 2. تفعيل مستمع البروفايل الجديد
        unsubscribeProfileRef.current = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            setProfile({ ...snapshot.data(), uid: snapshot.id } as UserProfile);
            setLoading(false);
          } else {
            // مزامنة الملف إذا لم يكن موجوداً
            syncUserProfile(firebaseUser).catch(() => setLoading(false));
          }
        }, (err) => {
          console.warn("[AUTH_SYNC] Listener Guard Active");
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // تنظيف كافة المستمعات عند مغادرة الصفحة أو التطبيق
    return () => {
      unsubscribeAuth();
      if (unsubscribeProfileRef.current) {
        unsubscribeProfileRef.current();
        unsubscribeProfileRef.current = null;
      }
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
