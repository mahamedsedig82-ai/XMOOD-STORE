'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/app/lib/types';

export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // MASTER ADMINS - القائمة السيادية للإدارة العليا
  const MASTER_ADMINS = [
    "MAHAMEDFK3@GMAIL.COM", 
    "XMOODSTORE.SUPPORT@GMAIL.COM",
    "ADMIN@XMOOD.COM"
  ];

  useEffect(() => {
    if (!auth) return;
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      // إذا لم يوجد مستخدم، ننهي التحميل فوراً
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!user || !db) return;

    const userDocRef = doc(db, 'users', user.uid);
    let isMounted = true;

    const syncProfile = async () => {
      try {
        const isMaster = MASTER_ADMINS.includes(user.email?.toUpperCase() || "");
        
        // جلب البيانات لأول مرة للتأكد من وجود البروفايل
        const docSnap = await getDoc(userDocRef);
        
        if (!docSnap.exists()) {
          const initialProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || "عضو",
            fullName: user.displayName || "",
            email: user.email || "",
            walletBalance: isMaster ? 999999 : 0,
            role: isMaster ? 'owner' : 'user',
            label: isMaster ? 'المدير العام' : 'عضو موثق',
            photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
            createdAt: new Date().toISOString(),
            isVerified: user.emailVerified,
            affinityPoints: isMaster ? 1000 : 50
          };
          await setDoc(userDocRef, initialProfile);
          if (isMounted) setProfile(initialProfile);
        } else {
          const currentData = docSnap.data() as UserProfile;
          // الترقية السيادية التلقائية عند الدخول ببريد المدير
          if (isMaster && currentData.role !== 'owner') {
            await updateDoc(userDocRef, { role: 'owner', label: 'المدير العام' });
            if (isMounted) setProfile({ ...currentData, role: 'owner', uid: user.uid });
          } else {
            if (isMounted) setProfile({ ...currentData, uid: user.uid });
          }
        }

        // الاستماع للتغييرات اللحظية لضمان تفاعل الموقع مع تغييرات الرتب
        const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists() && isMounted) {
            setProfile({ ...(snapshot.data() as UserProfile), uid: snapshot.id });
            setLoading(false); // ننهي التحميل فقط بعد وصول أول "سناب شوت" ناجح
          }
        }, (err) => {
          console.error("Profile Snapshot Error:", err);
          if (isMounted) setLoading(false);
        });

        return unsubscribe;

      } catch (err) {
        console.error("Critical Auth Sync Error:", err);
        if (isMounted) setLoading(false);
      }
    };

    const unsubscribePromise = syncProfile();

    return () => {
      isMounted = false;
      unsubscribePromise.then(unsub => unsubscribe && unsub?.());
    };
  }, [user, db]);

  // فحص الصلاحية الإدارية - يدعم المدير، المشرفين، الوكلاء، المصممين، وغيرهم
  const isMasterByEmail = user && MASTER_ADMINS.includes(user.email?.toUpperCase() || "");
  const isAdmin = !!(isMasterByEmail || (profile?.role && ['owner', 'admin', 'gm', 'store_manager', 'design_manager', 'designer', 'accountant', 'support', 'middleman', 'agent'].includes(profile.role)));

  return { 
    user, 
    profile, 
    loading, 
    isVerified: user?.emailVerified || false,
    isAdmin,
    isMaster: isMasterByEmail,
    role: profile?.role
  };
}
