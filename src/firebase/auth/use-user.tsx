
'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/app/lib/types';
import { syncUserProfile } from '@/lib/auth';

/**
 * خطاف مخصص لإدارة حالة المستخدم والتحقق السيادي.
 * تم تحصينه لمنع الأخطاء الداخلية وحلقات التكرار اللانهائية.
 */
export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const MASTER_ADMINS = ["MAHAMEDFK3@GMAIL.COM", "XMOODSTORE.SUPPORT@GMAIL.COM", "ADMIN@XMOOD.COM"];

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

    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    let isMounted = true;

    const unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
      if (!isMounted) return;

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        
        // التحقق من الرتبة السيادية للمدراء مع منع الحلقات التكرارية
        const isMaster = MASTER_ADMINS.includes(user.email?.toUpperCase() || "");
        if (isMaster && data.role !== 'owner') {
          updateDoc(userDocRef, { role: 'owner', label: 'المدير العام السيادي' }).catch(() => {});
        }

        setProfile({ ...data, uid: snapshot.id });
        setLoading(false); 
      } else {
        // إنشاء تلقائي للملف في حال الفقدان (Self-Healing)
        syncUserProfile(user).catch(() => {
           if (isMounted) setLoading(false);
        });
      }
    }, (err) => {
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
