"use client";

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, firestore as db } from "@/firebase";

/**
 * 🛡️ Profile Sync Service 11.0 (Atomic & Idempotent)
 * مزامنة ملف المستخدم بذكاء يمنع الكتابة فوق البيانات الحساسة (الرصيد، الرتب).
 */
export async function syncUserProfile(user: User, additionalData: any = {}) {
  if (!user || !db) return;
  const userRef = doc(db, "users", user.uid);
  try {
    const userDoc = await getDoc(userRef);
    
    const baseProfile = {
      uid: user.uid,
      displayName: additionalData.displayName || user.displayName || user.email?.split("@")[0] || "عضو",
      email: user.email?.toLowerCase().trim() || "",
      isVerified: user.emailVerified || false,
      updatedAt: serverTimestamp(),
      ...additionalData
    };

    if (!userDoc.exists()) {
      console.log("[AUTH_SYNC] Creating New Sovereign Profile for:", user.uid);
      await setDoc(userRef, {
        ...baseProfile,
        walletBalance: 0,
        role: 'user',
        label: 'عضو موثق',
        photoURL: user.photoURL || `https://aboutmsr.com/wp-content/uploads/2025/02/766f8e72-20c2-4824-814c-1d90f5080e77.png`,
        createdAt: new Date().toISOString(),
      }, { merge: true });
    } else {
      const existing = userDoc.data();
      const updates: any = {};
      
      // مزامنة دقيقة فقط للحقول المتغيرة
      if (existing.isVerified !== user.emailVerified) updates.isVerified = user.emailVerified;
      if (additionalData.displayName && existing.displayName !== additionalData.displayName) updates.displayName = additionalData.displayName;
      if (additionalData.phoneNumber && existing.phoneNumber !== additionalData.phoneNumber) updates.phoneNumber = additionalData.phoneNumber;

      if (Object.keys(updates).length > 0) {
        console.log("[AUTH_SYNC] Atomic Profile Update for:", user.uid);
        await updateDoc(userRef, { 
          ...updates,
          updatedAt: serverTimestamp() 
        });
      }
    }
  } catch (error) {
    console.error("[AUTH_SYNC_FATAL]", error);
    throw error;
  }
}

/**
 * 🛡️ Sovereign Wipe Logout
 */
export const logout = async () => {
  if (!auth) return;
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('xmood-cart');
      localStorage.removeItem('xmood-theme');
      sessionStorage.clear();
    }
    await signOut(auth);
    window.location.href = '/login';
  } catch (error) {
    window.location.href = '/login';
  }
};

/**
 * 🛡️ Google Auth Bridge
 */
export const loginWithGoogle = async () => {
  if (!auth) return;
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    await syncUserProfile(result.user);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      return signInWithRedirect(auth, provider);
    }
    throw error;
  }
};

/**
 * 🛡️ Verification Service
 */
export const sendAccountVerification = async (user: User) => {
  if (!user) return;
  try {
    const actionCodeSettings = {
      url: 'https://xmood-36c92.firebaseapp.com/verify-email',
      handleCodeInApp: true,
    };
    await sendEmailVerification(user, actionCodeSettings);
  } catch (error: any) {
    console.error("[AUTH_VERIFY_FAILURE]", error.message);
    throw error;
  }
};

/**
 * 🛡️ Atomic Registration Flow
 * إنشاء حساب Firebase و Firestore في وحدة زمنية واحدة لضمان الاستقرار.
 */
export const registerEmail = async (email: string, pass: string, name: string) => {
  if (!email || typeof email !== 'string') throw new Error("EMAIL_REQUIRED");
  
  // 🛡️ التطهير النهائي قبل الإرسال للـ SDK
  const cleanEmail = email.trim().toLowerCase();
  
  if (process.env.NODE_ENV === 'development') {
    console.log("[AUTH_SDK] Dispatching Account Creation for:", cleanEmail);
  }

  // 1. إنشاء حساب المصادقة
  const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
  
  // 2. تحديث الاسم في Auth
  await updateProfile(res.user, { displayName: name });
  
  // 3. المزامنة الذرية مع Firestore
  await syncUserProfile(res.user, { displayName: name });
  
  return res;
};

/**
 * 🛡️ Robust Login Pipeline
 */
export const loginEmail = (email: string, pass: string) => {
  if (!email || typeof email !== 'string') throw new Error("EMAIL_REQUIRED");
  const cleanEmail = email.trim().toLowerCase();
  
  if (process.env.NODE_ENV === 'development') {
    console.log("[AUTH_SDK] Dispatching Login Request for:", cleanEmail);
  }
  
  return signInWithEmailAndPassword(auth, cleanEmail, pass);
};
