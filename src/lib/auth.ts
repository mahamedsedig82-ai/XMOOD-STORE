"use client";

import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut,
  User,
  GoogleAuthProvider
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase";

/**
 * Sovereign Sync: Ensures user profile exists in Firestore.
 */
export async function syncUserProfile(user: User) {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  
  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      const initialProfile = {
        uid: user.uid,
        displayName: user.displayName?.split(" ")[0] || "عضو",
        fullName: user.displayName || "",
        email: user.email?.toLowerCase(),
        walletBalance: 0,
        role: 'user',
        label: 'عضو بريميوم',
        photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        isVerified: true,
        affinityPoints: 50,
        updatedAt: serverTimestamp()
      };
      await setDoc(userRef, initialProfile);
      console.log("[AUTH-DEBUG] New profile created for:", user.email);
    } else {
      await setDoc(userRef, { 
        lastSeen: new Date().toISOString(),
        updatedAt: serverTimestamp() 
      }, { merge: true });
    }
  } catch (error) {
    console.error("[AUTH-DEBUG] Sync Error:", error);
  }
}

/**
 * Hybrid Login Strategy:
 * Tries Popup first, falls back to Redirect on mobile/blocked environments.
 */
export const loginWithGoogle = async () => {
  console.log("[AUTH-DEBUG] Initiating Hybrid Login...");
  try {
    // Try Popup first (Best UX for Desktop)
    const result = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(result.user);
    return result.user;
  } catch (error: any) {
    console.warn("[AUTH-DEBUG] Popup failed/blocked, falling back to Redirect. Code:", error.code);
    
    // Logic for falling back to Redirect
    if (
      error.code === 'auth/popup-blocked' || 
      error.code === 'auth/cancelled-popup-request' ||
      error.code === 'auth/popup-closed-by-user' ||
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) // Auto-redirect on mobile
    ) {
      return await signInWithRedirect(auth, googleProvider);
    }
    
    throw error;
  }
};

/**
 * Recovery Handler: Catches user returning from Redirect.
 */
export const handleAuthRedirect = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      console.log("[AUTH-DEBUG] Redirect success for:", result.user.email);
      await syncUserProfile(result.user);
      return result.user;
    }
  } catch (error) {
    console.error("[AUTH-DEBUG] Redirect Recovery Error:", error);
  }
  return null;
};

export const logout = () => signOut(auth);
