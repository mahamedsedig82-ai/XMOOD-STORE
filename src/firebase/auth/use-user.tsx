
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

  const MASTER_ADMINS = [
    "MAHAMEDFK3@GMAIL.COM", 
    "XMOODSTORE.SUPPORT@GMAIL.COM",
    "ADMIN@XMOOD.COM"
  ];

  const staffRoles = [
    'owner', 'admin', 'gm', 'store_manager', 'design_manager', 
    'designer', 'accountant', 'support', 'middleman', 'agent', 'community_mod'
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

    const userDocRef = doc(db, 'users', user.uid);
    let isMounted = true;

    const syncProfile = async () => {
      try {
        const isMaster = MASTER_ADMINS.includes(user.email?.toUpperCase() || "");
        
        // جلب البيانات لأول مرة للتأكد من وجود المستند
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
          }
        } else {
          const currentData = docSnap.data() as UserProfile;
          if (isMaster && currentData.role !== 'owner') {
            await updateDoc(userDocRef, { role: 'owner', label: 'المدير العام' });
          }
          if (isMounted) {
            setProfile({ ...currentData, uid: docSnap.id });
          }
        }

        // المستمع اللحظي للتحديثات هو المصدر النهائي والوحيد لتغيير حالة التحميل
        const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
          if (isMounted) {
            if (snapshot.exists()) {
              const data = snapshot.data() as UserProfile;
              setProfile({ ...data, uid: snapshot.id });
            } else {
              setProfile(null);
            }
            setLoading(false); 
          }
        }, (err) => {
          console.error("Firestore Profile Sync Error:", err);
          if (isMounted) setLoading(false);
        });

        return unsubscribe;
      } catch (err) {
        console.error("Profile Sync Logic Error:", err);
        if (isMounted) setLoading(false);
        return () => {};
      }
    };

    const unsubPromise = syncProfile();

    return () => {
      isMounted = false;
      unsubPromise.then(unsub => {
        if (unsub) unsub();
      });
    };
  }, [user, db]);

  // التحقق من أن المستخدم هو طاقم عمل
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
