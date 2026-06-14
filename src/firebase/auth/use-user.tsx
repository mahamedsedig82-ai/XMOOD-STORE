'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/app/lib/types';

/**
 * هوك سيادي مطور لإدارة الهوية والرتب التخصصية
 * يمنع انتهاء حالة التحميل قبل التأكد اليقيني من البيانات في Firestore
 */
export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const MASTER_ADMINS = [
    "MAHAMEDFK3@GMAIL.COM", 
    "XMOODSTORE.SUPPORT@GMAIL.COM",
    "ADMIN@XMOOD.COM"
  ];

  const staffRoles = [
    'owner', 'admin', 'gm', 'community_admin', 'community_mod', 
    'store_manager', 'design_manager', 'designer', 'accountant', 
    'support', 'middleman', 'agent'
  ];

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

    // حالة التحميل تظل فعالة طالما لم نصل للملف الشخصي
    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    let isMounted = true;

    const unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
      if (isMounted) {
        if (snapshot.exists()) {
          const data = snapshot.data() as UserProfile;
          
          // حماية سيادية لرتبة المالك
          const isMaster = MASTER_ADMINS.includes(user.email?.toUpperCase() || "");
          if (isMaster && data.role !== 'owner') {
            updateDoc(userDocRef, { role: 'owner', label: 'المدير العام' });
          }

          setProfile({ ...data, uid: snapshot.id });
          setLoading(false); 
        } else {
          // إنشاء ملف شخصي إذا لم يوجد فوراً
          const isMaster = MASTER_ADMINS.includes(user.email?.toUpperCase() || "");
          const initialProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || "عضو",
            fullName: user.displayName || "",
            email: user.email || "",
            walletBalance: isMaster ? 999999 : 0,
            role: isMaster ? 'owner' : 'user',
            label: isMaster ? 'المدير العام' : 'عضو بريميوم',
            photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
            createdAt: new Date().toISOString(),
            isVerified: user.emailVerified,
            affinityPoints: isMaster ? 1000 : 50
          };
          setDoc(userDocRef, initialProfile).then(() => {
            if (isMounted) {
              setProfile(initialProfile);
              setLoading(false);
            }
          });
        }
      }
    }, (err) => {
      console.error("Critical Access Sync Error:", err);
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribeProfile();
    };
  }, [user, db]);

  const isStaff = !!(user && (
    MASTER_ADMINS.includes(user.email?.toUpperCase() || "") || 
    (profile?.role && staffRoles.includes(profile.role))
  ));
  
  return { 
    user, 
    profile, 
    // المفتاح لثبات الدخول: عدم انتهاء التحميل إلا بوجود بيانات مؤكدة
    loading: loading || (!!user && !profile),
    isVerified: user?.emailVerified || false,
    isAdmin: isStaff,
    role: profile?.role
  };
}
