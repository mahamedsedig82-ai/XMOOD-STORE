
'use client';

import { useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/app/lib/types';

/**
 * Sovereign hook for Identity & Role Management.
 * Optimized to handle redirect flows and prevent background race conditions.
 */
export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const syncInProgress = useRef(false);

  const MASTER_ADMINS = [
    "MAHAMEDFK3@GMAIL.COM", 
    "XMOODSTORE.SUPPORT@GMAIL.COM",
    "ADMIN@XMOOD.COM"
  ];

  useEffect(() => {
    if (!auth) return;
    
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("[AUTH-DEBUG] Auth state changed:", firebaseUser?.email);
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        syncInProgress.current = false;
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!user || !db) return;

    // تعطيل المزامنة التلقائية إذا كان المستخدم في صفحة الدخول لإعطاء الأولوية لمعالج التوجيه (Redirect Handler)
    if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
      console.log("[AUTH-DEBUG] useUser waiting for Login Page handler...");
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    let isMounted = true;

    const unsubscribeProfile = onSnapshot(userDocRef, async (snapshot) => {
      if (!isMounted) return;

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        
        // المزامنة السيادية للمدراء
        const isMaster = MASTER_ADMINS.includes(user.email?.toUpperCase() || "");
        if (isMaster && data.role !== 'owner') {
          updateDoc(userDocRef, { role: 'owner', label: 'المدير العام', updatedAt: serverTimestamp() });
        }

        setProfile({ ...data, uid: snapshot.id });
        setLoading(false); 
      } else {
        // حماية من التكرار أثناء الإنشاء التلقائي
        if (syncInProgress.current) return;
        syncInProgress.current = true;

        console.log("[AUTH-DEBUG] No profile found, creating default...");
        const isMaster = MASTER_ADMINS.includes(user.email?.toUpperCase() || "");
        const initialProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName?.split(' ')[0] || user.email?.split('@')[0] || "عضو",
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

        try {
          await setDoc(userDocRef, { ...initialProfile, updatedAt: serverTimestamp() }, { merge: true });
          if (isMounted) {
            setProfile(initialProfile);
            setLoading(false);
          }
        } catch (e) {
          console.error("Auto-Profile creation failed:", e);
        } finally {
          syncInProgress.current = false;
        }
      }
    }, (err) => {
      console.error("Profile Sync Error:", err);
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
