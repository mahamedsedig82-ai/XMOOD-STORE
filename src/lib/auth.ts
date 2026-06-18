"use client";

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User,
  sendEmailVerification,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, firestore as db } from "@/firebase";

/**
 * 🛡️ Profile Sync Service
 */
export async function syncUserProfile(user: User, additionalData: any = {}) {
  if (!user || !db) return;
  const userRef = doc(db, "users", user.uid);
  try {
    const userDoc = await getDoc(userRef);
    const baseProfile = {
      uid: user.uid,
      displayName: additionalData.displayName || user.displayName || user.email?.split("@")[0] || "عضو",
      email: user.email?.toLowerCase(),
      isVerified: user.emailVerified || false,
      updatedAt: serverTimestamp(),
      ...additionalData
    };

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        ...baseProfile,
        walletBalance: 0,
        role: 'user',
        label: 'عضو موثق',
        photoURL: `https://aboutmsr.com/wp-content/uploads/2025/02/766f8e72-20c2-4824-814c-1d90f5080e77.png`,
        createdAt: new Date().toISOString(),
      }, { merge: true });
    } else {
      await updateDoc(userRef, baseProfile);
    }
  } catch (error) {
    console.error("[AUTH_SYNC] Error:", error);
  }
}

/**
 * 🛡️ Sovereign Wipe Logout (إصلاح ca9/b815 الجذري)
 * تنفيذ تسلسل الخروج النظيف لضمان عزل الجلسة تماماً.
 */
export const logout = async () => {
  if (!auth) return;
  try {
    // 1. مسح البيانات المحلية والـ Storage أولاً لمنع المستمعات من محاولة الوصول
    if (typeof window !== 'undefined') {
      localStorage.removeItem('xmood-cart');
      sessionStorage.clear();
    }
    
    // 2. تسجيل الخروج من Firebase (سيقوم useUser آلياً بإلغاء مستمع البروفايل)
    await signOut(auth);
    
    // 3. إعادة تحميل الصفحة إجبارياً لضمان تصفير حالة الـ SDK تماماً (Hard Reset)
    window.location.href = '/login';
  } catch (error) {
    console.error("[AUTH_LOGOUT] Error:", error);
    window.location.href = '/login';
  }
};

/**
 * 🛡️ Verification Service
 */
export const sendAccountVerification = async (user: User) => {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://xmood-36c92.firebaseapp.com';
    await sendEmailVerification(user, {
      url: `${baseUrl}/verify-email`,
      handleCodeInApp: true,
    });
  } catch (error) {
    console.error("[AUTH_VERIFY] Send Error:", error);
    throw error;
  }
};

export const registerEmail = async (email: string, pass: string, name: string) => {
  const res = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), pass);
  await updateProfile(res.user, { displayName: name });
  return res;
};

export const loginEmail = (e: string, p: string) => signInWithEmailAndPassword(auth, e.trim().toLowerCase(), p);
