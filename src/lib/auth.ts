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
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

/**
 * Sovereign Identity Sync: Ensures user profile exists in Firestore.
 */
export async function syncUserProfile(user: User, additionalData: any = {}) {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  
  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      const initialProfile = {
        uid: user.uid,
        displayName: user.displayName || additionalData.displayName || user.email?.split("@")[0] || "عضو",
        email: user.email?.toLowerCase(),
        walletBalance: 0,
        role: 'user',
        label: 'عضو بريميوم',
        photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        isVerified: user.emailVerified || false,
        affinityPoints: 50,
        updatedAt: serverTimestamp(),
        ...additionalData
      };
      await setDoc(userRef, initialProfile);
    } else {
      await setDoc(userRef, { 
        lastSeen: new Date().toISOString(),
        updatedAt: serverTimestamp() 
      }, { merge: true });
    }
  } catch (error) {
    console.error("Profile Sync Error:", error);
  }
}

/**
 * Magic Link: Send a passwordless login link to email.
 */
export const sendMagicLink = async (email: string) => {
  const actionCodeSettings = {
    url: `${window.location.origin}/verify-email`,
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem('emailForSignIn', email);
};

/**
 * Handle Magic Link Verification
 */
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
