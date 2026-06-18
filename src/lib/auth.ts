"use client";

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User,
  sendEmailVerification,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, addDoc, collection } from "firebase/firestore";
import { auth, db } from "./firebase";

/**
 * تسجيل الأحداث الأمنية لضمان التتبع والتحليل.
 */
export async function logSecurityEvent(type: 'login_success' | 'auth_fail' | 'access_denied' | 'tamper_attempt', description: string, userEmail?: string) {
  if (!db) return;
  try {
    await addDoc(collection(db, "security_logs"), {
      type,
      description,
      userEmail: userEmail || "UNKNOWN",
      status: type === 'login_success' ? 'success' : 'alert',
      timestamp: new Date().toISOString()
    });
  } catch (e) {}
}

/**
 * مزامنة ملف المستخدم الشخصي مع قاعدة البيانات.
 * تم تحصينها لمنع إنشاء بيانات ناقصة أو تالفة.
 */
export async function syncUserProfile(user: User, additionalData: any = {}) {
  if (!user || !db) return;
  const userRef = doc(db, "users", user.uid);
  try {
    const userDoc = await getDoc(userRef).catch(() => null);
    
    if (!userDoc || !userDoc.exists()) {
      const initialProfile = {
        uid: user.uid,
        displayName: additionalData.displayName || user.displayName || user.email?.split("@")[0] || "عضو",
        fullName: additionalData.fullName || additionalData.displayName || "",
        email: user.email?.toLowerCase(),
        phoneNumber: additionalData.phoneNumber || "",
        age: Number(additionalData.age) || 0,
        walletBalance: 0,
        role: 'user',
        label: 'عضو بريميوم',
        securityLevel: 'enhanced',
        isCaptchaVerified: true,
        photoURL: additionalData.photoURL || user.photoURL || `https://aboutmsr.com/wp-content/uploads/2025/02/766f8e72-20c2-4824-814c-1d90f5080e77.png`,
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        isVerified: user.emailVerified || false,
        affinityPoints: 50,
        updatedAt: serverTimestamp(),
      };
      await setDoc(userRef, initialProfile, { merge: true });
      await logSecurityEvent('login_success', "تأسيس الهوية الرقمية والمزامنة", user.email || "");
    } else {
      await updateDoc(userRef, { 
        lastSeen: new Date().toISOString(),
        updatedAt: serverTimestamp(),
        isVerified: user.emailVerified || false,
        ...additionalData
      });
    }
  } catch (error) {
    console.error("[AUTH_SYNC] Error:", error);
  }
}

/**
 * إرسال رابط توثيق الحساب مع تحصين مسار العودة.
 */
export const sendAccountVerification = async (user: User) => {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://xmood-36c92.firebaseapp.com';
    await sendEmailVerification(user, {
      url: `${baseUrl}/verify-email`,
      handleCodeInApp: true,
    });
    await logSecurityEvent('login_success', "إرسال رابط التوثيق السيادي", user.email || "");
  } catch (error) {
    console.error("[VERIFY_SEND] Error:", error);
    throw error;
  }
};

/**
 * محرك إنشاء العضوية الجديد والمبسط.
 */
export const registerEmail = async (email: string, pass: string, name: string) => {
  const res = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), pass);
  await updateProfile(res.user, { displayName: name });
  return res;
};

export const loginEmail = (e: string, p: string) => signInWithEmailAndPassword(auth, e.trim().toLowerCase(), p);

export const logout = async () => {
  const currentUser = auth.currentUser;
  if (currentUser) await logSecurityEvent('login_success', "خروج آمن من النظام", currentUser.email || "");
  return signOut(auth);
};