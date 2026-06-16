'use client';

import { useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/app/lib/types';
import { syncUserProfile } from '@/lib/auth';

/**
 * خطاف الهوية السيادي: يدير الجلسة والملف الشخصي للأعضاء.
 */
export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isSyncing = useRef(false);

  const MASTER_ADMINS = [
    "MAHAMEDFK3@GMAIL.COM", 
    "XMOODSTORE.SUPPORT@GMAIL.COM",
    "ADMIN@XMOOD.COM"
  ];

  useEffect(() => {
    if (!auth) return;
    
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("[AUTH-DEBUG] تغيرت حالة المصادقة:", firebaseUser?.email);
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        isSyncing.current = false;
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!user || !db) return;

    // منع التداخل إذا كان المستخدم في صفحة الدخول (تترك المهمة لمعالج الصفحة)
    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    let isMounted = true;

    const unsubscribeProfile = onSnapshot(userDocRef, async (snapshot) => {
      if (!isMounted) return;

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        
        // ترقية تلقائية للمدراء الأساسيين
        const isMaster = MASTER_ADMINS.includes(user.email?.toUpperCase() || "");
        if (isMaster && data.role !== 'owner') {
          updateDoc(userDocRef, { role: 'owner', label: 'المدير العام', updatedAt: serverTimestamp() });
        }

        setProfile({ ...data, uid: snapshot.id });
        setLoading(false); 
      } else {
        // إذا لم يوجد ملف شخصي، نقوم بإنشائه (Idempotent)
        if (isSyncing.current) return;
        isSyncing.current = true;
        
        await syncUserProfile(user);
        
        if (isMounted) {
           isSyncing.current = false;
           // سنعتمد على التحديث القادم من onSnapshot
        }
      }
    }, (err) => {
      console.error("[AUTH-DEBUG] خطأ في مراقبة البروفايل:", err);
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribeProfile();
    };
  }, [user, db]);

  const isStaff = !!(user && (
    MASTER_ADMINS.includes(user.email?.toUpperCase() || "") || 
    ['owner', 'admin', 'gm', 'store_manager', 'design_manager', 'designer', 'accountant', 'support', 'middleman', 'agent'].includes(profile?.role || '')
  ));
  
  return { 
    user, 
    profile, 
    loading: loading || (!!user && !profile),
    isVerified: user?.emailVerified || false,
    isAdmin: isStaff,
    role: profile?.role
  };
}
