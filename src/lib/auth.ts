
"use client";

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  User,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

/**
 * Sovereign Identity Sync: Ensures user profile exists in Firestore with full security data.
 */
export async function syncUserProfile(user: User, additionalData: any = {}) {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  
  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      const initialProfile = {
        uid: user.uid,
        displayName: additionalData.displayName || user.displayName || user.email?.split("@")[0] || "عضو",
        fullName: additionalData.fullName || "",
        email: user.email?.toLowerCase(),
        phoneNumber: additionalData.phoneNumber || "",
        walletBalance: 0,
        role: 'user',
        label: 'عضو بريميوم',
        securityLevel: 'enhanced',
        isCaptchaVerified: true,
        photoURL: additionalData.photoURL || user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        isVerified: user.emailVerified || false,
        affinityPoints: 50,
        securityQuestion: additionalData.securityQuestion || "",
        securityAnswer: additionalData.securityAnswer || "",
        updatedAt: serverTimestamp(),
      };
      await setDoc(userRef, initialProfile);
    } else {
      const updatePayload = { 
        lastSeen: new Date().toISOString(),
        updatedAt: serverTimestamp(),
        ...additionalData
      };
      await updateDoc(userRef, updatePayload);
    }
  } catch (error) {
    console.error("Profile Sync Error:", error);
    throw error;
  }
}

/**
 * Improved Magic Link Delivery: Optimized for default subdomains.
 * We use the current origin to ensure the link matches the domain it's sent from.
 */
export const sendMagicLink = async (email: string) => {
  const cleanEmail = email.trim().toLowerCase();
  
  // لضمان الوصول للـ Inbox عند استخدام نطاق افتراضي، يجب أن يكون الرابط بسيطاً ومباشراً
  const actionCodeSettings = {
    url: `${window.location.origin}/verify-email`,
    handleCodeInApp: true,
  };
  
  try {
    // تسجيل البريد في التخزين المحلي لتسهيل عملية التحقق عند العودة
    await sendSignInLinkToEmail(auth, cleanEmail, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', cleanEmail);
  } catch (error) {
    console.error("[AUTH] Magic Link Error:", error);
    throw error;
  }
};

export const completeMagicLinkSignIn = async () => {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('يرجى تأكيد بريدك الإلكتروني لإتمام الدخول:');
    }
    if (email) {
      const result = await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
      await syncUserProfile(result.user);
      return result.user;
    }
  }
  return null;
};

export const loginEmail = (e: string, p: string) => signInWithEmailAndPassword(auth, e.trim().toLowerCase(), p);
export const registerEmail = (e: string, p: string) => createUserWithEmailAndPassword(auth, e.trim().toLowerCase(), p);
export const resetPassword = (e: string) => sendPasswordResetEmail(auth, e.trim().toLowerCase());
export const logout = () => signOut(auth);
