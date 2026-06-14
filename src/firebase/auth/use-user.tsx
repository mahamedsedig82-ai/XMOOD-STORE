
'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/app/lib/types';

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
      // إذا لم يوجد مستخدم نهائياً، ننهي حالة التحميل فوراً
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!user || !db) return;

    // نبدأ حالة التحميل للملف الشخصي
    setLoading(true);

    const userDocRef = doc(db, 'users', user.uid);
    let isMounted = true;

    const syncProfile = async () => {
      try {
        const isMaster = MASTER_ADMINS.includes(user.email?.toUpperCase() || "");
        
        // جلب أولي سريع للملف
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
          if (isMounted) {
            setProfile(initialProfile);
            setLoading(false);
          }
        } else {
          const currentData = docSnap.data() as UserProfile;
          if (isMaster && currentData.role !== 'owner') {
            await updateDoc(userDocRef, { role: 'owner', label: 'المدير العام' });
          }
          if (isMounted) {
            setProfile({ ...currentData, uid: docSnap.id });
            // لا ننهي التحميل هنا، ننتظر مستمع اللحظات Snapshots لضمان ثبات البيانات
          }
        }

        // الاستماع اللحظي - هو الضمان الحقيقي لبقاء المستخدم في صفحته
        const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
          if (isMounted) {
            if (snapshot.exists()) {
              const data = snapshot.data() as UserProfile;
              setProfile({ ...data, uid: snapshot.id });
            } else {
              setProfile(null);
            }
            setLoading(false); // تم جلب البيانات وتثبيتها، ننهي حالة التحميل بأمان
          }
        }, (err) => {
          console.error("Firestore Sync Error:", err);
          if (isMounted) setLoading(false);
        });

        return unsubscribe;
      } catch (err) {
        console.error("Profile Logic Error:", err);
        if (isMounted) setLoading(false);
        return () => {};
      }
    };

    const unsubPromise = syncProfile();

    return () => {
      isMounted = false;
      unsubPromise.then(unsub => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, [user, db]);

  // صلاحية طاقم العمل
  const isStaff = !!(user && (
    MASTER_ADMINS.includes(user.email?.toUpperCase() || "") || 
    (profile?.role && staffRoles.includes(profile.role))
  ));
  
  return { 
    user, 
    profile, 
    loading, 
    isVerified: user?.emailVerified || false,
    isAdmin: isStaff,
    role: profile?.role
  };
}
