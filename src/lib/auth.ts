
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
 * خوارزمية رصد التلاعب: تكتشف الرموز الضخمة والكلمات المشبوهة
 */
export function isSuspiciousInput(text: string): { isSuspicious: boolean; reason: string } {
  if (!text) return { isSuspicious: false, reason: "" };
  
  // 1. فحص الطول المفرط (أكثر من 1000 حرف)
  if (text.length > 1000) return { isSuspicious: true, reason: "كتلة نصية ضخمة بشكل مريب" };

  // 2. فحص تكرار الرموز بكثافة (أكثر من 20 رمز متتالي)
  const symbolPattern = /[^\w\s]{20,}/g;
  if (symbolPattern.test(text)) return { isSuspicious: true, reason: "استخدام رموز متكررة لمحاولة الحقن" };

  // 3. فحص الكلمات المفتاحية للهجمات البرمجية
  const maliciousKeywords = [
    "<script", "javascript:", "eval(", "onload=", "onerror=", 
    "select * from", "drop table", "union select", "insert into"
  ];
  
  const lowerText = text.toLowerCase();
  const foundKeyword = maliciousKeywords.find(key => lowerText.includes(key));
  if (foundKeyword) return { isSuspicious: true, reason: `محاولة حقن كود بربع الكلمة: ${foundKeyword}` };

  return { isSuspicious: false, reason: "" };
}

/**
 * تسجيل الأحداث الأمنية لضمان "التتبع" في لوحة الإدارة.
 */
export async function logSecurityEvent(type: 'login_success' | 'auth_fail' | 'access_denied' | 'tamper_attempt', description: string, userEmail?: string) {
  if (!db) return;
  try {
    addDoc(collection(db, "security_logs"), {
      type,
      description,
      userEmail: userEmail || "UNKNOWN",
      status: type === 'login_success' ? 'success' : 'alert',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    // Fail silently in offline mode to avoid crashing app
  }
}

/**
 * Sovereign Identity Sync: Ensures user profile exists in Firestore with full security data.
 */
export async function syncUserProfile(user: User, additionalData: any = {}) {
  if (!user || !db) return;
  const userRef = doc(db, "users", user.uid);
  
  try {
    // Avoid blocking UI if offline
    const userDoc = await getDoc(userRef).catch(() => null);
    
    if (!userDoc || !userDoc.exists()) {
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
      setDoc(userRef, initialProfile, { merge: true });
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
