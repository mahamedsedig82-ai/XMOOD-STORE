"use client";

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  User,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, addDoc, collection } from "firebase/firestore";
import { auth, db } from "./firebase";

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
  } catch (e) {}
}

export async function syncUserProfile(user: User, additionalData: any = {}) {
  if (!user || !db) return;
  const userRef = doc(db, "users", user.uid);
  try {
    const userDoc = await getDoc(userRef).catch(() => null);
    if (!userDoc || !userDoc.exists()) {
      const initialProfile = {
        uid: user.uid,
        displayName: additionalData.displayName || user.displayName || user.email?.split("@")[0] || "عضو",
        fullName: additionalData.fullName || "",
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
        securityQuestion: additionalData.securityQuestion || "",
        securityAnswer: additionalData.securityAnswer || "",
        updatedAt: serverTimestamp(),
      };
      await setDoc(userRef, initialProfile, { merge: true });
      logSecurityEvent('login_success', "إنشاء عضوية جديدة ومزامنة الملف", user.email || "");
    } else {
      await updateDoc(userRef, { 
        lastSeen: new Date().toISOString(),
        updatedAt: serverTimestamp(),
        isVerified: user.emailVerified || false,
        ...additionalData
      });
    }
  } catch (error) {
    console.error("Profile Sync Error:", error);
  }
}

export const sendAccountVerification = async (user: User) => {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://xmood-36c92.firebaseapp.com';
    await sendEmailVerification(user, {
      url: `${baseUrl}/verify-email`,
      handleCodeInApp: true,
    });
    logSecurityEvent('login_success', "تم إرسال رابط توثيق البريد", user.email || "");
  } catch (error) {
    console.error("Verification Email Error:", error);
    throw error;
  }
};

export const registerEmail = async (email: string, pass: string, name: string) => {
  const res = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), pass);
  await updateProfile(res.user, { displayName: name });
  return res;
};

export const loginEmail = (e: string, p: string) => signInWithEmailAndPassword(auth, e.trim().toLowerCase(), p);
export const logout = () => {
  if (auth.currentUser) logSecurityEvent('login_success', "خروج آمن من النظام", auth.currentUser.email || "");
  return signOut(auth);
};
