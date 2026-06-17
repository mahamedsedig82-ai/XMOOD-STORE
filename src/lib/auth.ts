
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
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, addDoc, collection } from "firebase/firestore";
import { auth, db } from "./firebase";

/**
 * تسجيل الأحداث الأمنية لضمان "التتبع" في لوحة الإدارة.
 */
export async function logSecurityEvent(type: 'login_success' | 'auth_fail' | 'access_denied', description: string, userEmail?: string) {
  try {
    addDoc(collection(db, "security_logs"), {
      type,
      description,
      userEmail: userEmail || "UNKNOWN",
      status: type === 'login_success' ? 'success' : 'alert',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error("Failed to log security event");
  }
}

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
      setDoc(userRef, initialProfile);
      logSecurityEvent('login_success', "إنشاء عضوية جديدة ومزامنة الملف", user.email || "");
    } else {
      const updatePayload = { 
        lastSeen: new Date().toISOString(),
        updatedAt: serverTimestamp(),
        ...additionalData
      };
      updateDoc(userRef, updatePayload);
      logSecurityEvent('login_success', "تحديث جلسة دخول نشطة", user.email || "");
    }
  } catch (error) {
    console.error("Profile Sync Error:", error);
  }
}

/**
 * Improved Magic Link Delivery: Optimized for default subdomains.
 */
export const sendMagicLink = async (email: string) => {
  const cleanEmail = email.trim().toLowerCase();
  
  const actionCodeSettings = {
    url: `${window.location.origin}/verify-email`,
    handleCodeInApp: true,
  };
  
  try {
    await sendSignInLinkToEmail(auth, cleanEmail, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', cleanEmail);
    logSecurityEvent('login_success', "طلب إرسال رابط سحري للدخول", cleanEmail);
  } catch (error) {
    logSecurityEvent('auth_fail', "فشل إرسال رابط سحري", cleanEmail);
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
      syncUserProfile(result.user);
      return result.user;
    }
  }
  return null;
};

export const loginEmail = (e: string, p: string) => signInWithEmailAndPassword(auth, e.trim().toLowerCase(), p);
export const registerEmail = (e: string, p: string) => createUserWithEmailAndPassword(auth, e.trim().toLowerCase(), p);
export const resetPassword = (e: string) => sendPasswordResetEmail(auth, e.trim().toLowerCase());
export const logout = () => {
  logSecurityEvent('login_success', "خروج آمن من النظام", auth.currentUser?.email || "");
  return signOut(auth);
};
