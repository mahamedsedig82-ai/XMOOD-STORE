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
 * 🛡️ UNIVERSAL DATA PURIFIER
 * Ensures absolute string purity for Firebase Auth.
 */
const sanitizeEmail = (raw: any): string => {
  return String(raw || "")
    .replace(/\s/g, "") // Remove all standard whitespace
    .replace(/[^\x20-\x7E]/g, "") // Remove non-printable/hidden ASCII chars
    .trim()
    .toLowerCase();
};

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
      email: user.email?.toLowerCase().trim() || "",
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
        photoURL: user.photoURL || `https://aboutmsr.com/wp-content/uploads/2025/02/766f8e72-20c2-4824-814c-1d90f5080e77.png`,
        createdAt: new Date().toISOString(),
      }, { merge: true });
    } else {
      const existing = userDoc.data();
      const updates: any = {};
      if (existing.isVerified !== user.emailVerified) updates.isVerified = user.emailVerified;
      if (additionalData.displayName && existing.displayName !== additionalData.displayName) updates.displayName = additionalData.displayName;
      
      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, { ...updates, updatedAt: serverTimestamp() });
      }
    }
  } catch (error) {
    console.error("[AUTH_SYNC_FATAL]", error);
  }
}

/**
 * 🛡️ REGISTRATION PIPELINE (41.0)
 */
export const registerEmail = async (rawEmail: any, pass: string, name: string) => {
  const cleanEmail = sanitizeEmail(rawEmail);
  console.log(`[AUTH_FORENSIC] SIGNUP ATTEMPT: >>>${cleanEmail}<<< (Length: ${cleanEmail.length})`);

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error("تنسيق البريد الإلكتروني غير صالح.");
  }

  try {
    const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    await updateProfile(res.user, { displayName: name });
    return res;
  } catch (error: any) {
    console.error("[AUTH_FORENSIC] SIGNUP FAILURE:", error.code);
    throw error;
  }
};

/**
 * 🛡️ LOGIN PIPELINE (41.0)
 */
export const loginEmail = async (rawEmail: any, pass: string) => {
  const cleanEmail = sanitizeEmail(rawEmail);
  console.log(`[AUTH_FORENSIC] LOGIN ATTEMPT: >>>${cleanEmail}<<< (Length: ${cleanEmail.length})`);

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error("يرجى إدخال بريد إلكتروني صحيح.");
  }

  try {
    return await signInWithEmailAndPassword(auth, cleanEmail, pass);
  } catch (error: any) {
    console.error("[AUTH_FORENSIC] LOGIN FAILURE:", error.code);
    throw error;
  }
};

export const logout = async () => {
  if (!auth) return;
  await signOut(auth);
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  }
};

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

export const sendAccountVerification = async (user: User) => {
  if (!user) return;
  const actionCodeSettings = {
    url: 'https://xmood-36c92.firebaseapp.com/verify-email',
    handleCodeInApp: true,
  };
  await sendEmailVerification(user, actionCodeSettings);
};
