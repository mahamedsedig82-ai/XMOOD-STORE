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
 * This function preserves all existing data and only updates what is changed.
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
      console.log("[AUTH] New Sovereign Profile Created");
    } else {
      // Preserve existing data while updating relevant fields
      const updatePayload = { 
        lastSeen: new Date().toISOString(),
        updatedAt: serverTimestamp(),
        ...additionalData
      };
      await updateDoc(userRef, updatePayload);
      console.log("[AUTH] Sovereign Profile Synced");
    }
  } catch (error) {
    console.error("Profile Sync Error:", error);
    throw error;
  }
}

export const sendMagicLink = async (email: string) => {
  const actionCodeSettings = {
    url: `${window.location.origin}/verify-email`,
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem('emailForSignIn', email);
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

export const loginEmail = (e: string, p: string) => signInWithEmailAndPassword(auth, e, p);
export const registerEmail = (e: string, p: string) => createUserWithEmailAndPassword(auth, e, p);
export const resetPassword = (e: string) => sendPasswordResetEmail(auth, e);
export const logout = () => signOut(auth);
