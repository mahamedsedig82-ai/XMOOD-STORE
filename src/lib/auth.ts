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
 * 🛡️ Profile Sync Service 5.0
 * Purely idempotent sync function to prevent recursive writes and loops.
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
      const existing = userDoc.data();
      // Only update if verification state has actually changed to avoid cycles
      if (existing.isVerified !== user.emailVerified) {
        await updateDoc(userRef, { 
          isVerified: user.emailVerified,
          updatedAt: serverTimestamp() 
        });
      }
    }
  } catch (error) {
    console.error("[AUTH_SYNC] Error suppressed to ensure stability");
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
      sessionStorage.clear();
    }
    await signOut(auth);
    window.location.href = '/login';
  } catch (error) {
    window.location.href = '/login';
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
    console.error("[AUTH_VERIFY] Failed to send link");
    throw error;
  }
};

export const registerEmail = async (email: string, pass: string, name: string) => {
  const res = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), pass);
  await updateProfile(res.user, { displayName: name });
  return res;
};

export const loginEmail = (e: string, p: string) => signInWithEmailAndPassword(auth, e.trim().toLowerCase(), p);
