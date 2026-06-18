'use client';

import { useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/app/lib/types';
import { syncUserProfile } from '@/lib/auth';

export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  
  const MASTER_ADMINS = ["MAHAMEDFK3@GMAIL.COM", "XMOODSTORE.SUPPORT@GMAIL.COM"];

  useEffect(() => {
    isMounted.current = true;
    if (!auth) return;
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!isMounted.current) return;
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => { isMounted.current = false; unsubscribeAuth(); };
  }, [auth]);

  useEffect(() => {
    if (!user || !db) return;

    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);

    const unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
      if (!isMounted.current) return;

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        
        // التحقق السيادي الصامت للمدراء
        const isMaster = MASTER_ADMINS.includes(user.email?.toUpperCase() || "");
        if (isMaster && data.role !== 'owner') {
          updateDoc(userDocRef, { role: 'owner', label: 'المدير العام' }).catch(() => {});
        }

        setProfile({ ...data, uid: snapshot.id });
        setLoading(false); 
      } else {
        syncUserProfile(user).catch(() => { if (isMounted.current) setLoading(false); });
      }
    }, () => {
      if (isMounted.current) setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user, db]);

  const isAdmin = !!(user && (
    MASTER_ADMINS.includes(user.email?.toUpperCase() || "") || 
    ['owner', 'admin', 'gm'].includes(profile?.role || '')
  ));
  
  return { 
    user, 
    profile, 
    loading: loading || (!!user && !profile),
    isVerified: user?.emailVerified || false,
    isAdmin
  };
}
