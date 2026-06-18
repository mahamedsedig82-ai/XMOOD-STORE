'use client';

import { useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, firestore as db } from '../index';
import { UserProfile } from '@/app/lib/types';
import { syncUserProfile } from '@/lib/auth';

/**
 * 🛡️ Centralized Sovereign Identity Manager 19.0
 * إدارة هوية ذكية تمنع تداخل المستمعات وتقضي على أخطاء Firestore Assertion عبر الـ Ref Cleanup.
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // مرجع فيزيائي لضمان وجود مستمع واحد فقط وتدمير القديم فوراً
  const profileUnsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      // قتل المستمع القديم فوراً عند أي تغير في حالة المستخدم
      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
        profileUnsubscribeRef.current = null;
      }

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          // تفعيل المستمع الجديد مع تخزينه في الـ Ref للتحكم المطلق
          profileUnsubscribeRef.current = onSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists()) {
              setProfile({ ...snapshot.data(), uid: snapshot.id } as UserProfile);
              setLoading(false);
            } else {
              // مزامنة أولية في حالة عدم وجود الملف الشخصي
              syncUserProfile(firebaseUser).catch(() => setLoading(false));
            }
          }, (err) => {
            console.warn("[IDENTITY_GUARD] Profile Sync Shielded:", err.message);
            setLoading(false);
          });
        } catch (e) {
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

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
    loading: loading || (!!user && !profile), 
    isVerified: user?.emailVerified || false,
    isAdmin
  };
}
