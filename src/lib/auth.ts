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
 * 🛡️ Profile Sync Service
 * Ensures Auth and Firestore are in perfect synchronization.
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
 * 🛡️ Robust Email Sanitization
 */
const sanitizeEmail = (email: any): string => {
  if (!email || typeof email !== 'string') return "";
  // Deep clean whitespace and force lowercase
  return email.trim().toLowerCase();
};

/**
 * 🛡️ Sovereign Registration Flow
 */
export const registerEmail = async (email: string, pass: string, name: string) => {
  const cleanEmail = sanitizeEmail(email);
  
  if (!cleanEmail || !cleanEmail.includes('@')) {
    console.error("[REG_ERROR] Invalid email value detected:", cleanEmail);
    throw { code: 'auth/invalid-email' };
  }

  // 1. Create Auth Account
  const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
  
  // 2. Immediate Profile Updates
  await updateProfile(res.user, { displayName: name });
  
  // 3. Firestore Sync
  await syncUserProfile(res.user, { displayName: name });
  
  return res;
};

/**
 * 🛡️ Robust Login Pipeline
 */
export const loginEmail = (email: string, pass: string) => {
  const cleanEmail = sanitizeEmail(email);
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw { code: 'auth/invalid-email' };
  }
  return signInWithEmailAndPassword(auth, cleanEmail, pass);
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
