'use client';

import { useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, firestore as db } from '../index';
import { UserProfile } from '@/app/lib/types';
import { syncUserProfile } from '@/lib/auth';

/**
 * 🛡️ Robust Auth State Hook (Single Source of Truth)
 * يضمن عزل الجلسات تماماً وتنظيف كافة المستمعات عند تسجيل الخروج لمنع تسرب الذاكرة والأخطاء المتراكمة.
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
      // 1. تنظيف أي مستمع قديم فوراً عند تغير حالة المستخدم (Critical for Logout Fix)
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
        
        // 🛡️ حماية: لا تبدأ الاستماع إذا لم تكن الهوية جاهزة
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        try {
          unsubscribeProfileRef.current = onSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists()) {
              setProfile({ ...snapshot.data(), uid: snapshot.id } as UserProfile);
              setLoading(false);
            } else {
              // مزامنة أولية فقط إذا لم يوجد بروفايل
              syncUserProfile(firebaseUser).finally(() => {
                if (firebaseUser.uid === auth.currentUser?.uid) setLoading(false);
              });
            }
          }, (err) => {
            console.warn("[AUTH_GUARD] Profile Stream Halted:", err.message);
            // عند حدوث خطأ صلاحيات (غالباً بسبب Logout)، نقوم بالتنظيف
            setLoading(false);
          });
        } catch (e) {
          setLoading(false);
        }
      }
    });

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
