"use client";

import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut,
  UserCredential
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase";

/**
 * Creates or updates user profile in Firestore
 */
async function syncUserProfile(user: any) {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await setDoc(userRef, {
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
    });
  } else {
    await setDoc(userRef, { 
      lastSeen: new Date().toISOString(),
      updatedAt: serverTimestamp() 
    }, { merge: true });
  }
}

/**
 * Main Google Login Logic with Fallback
 */
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(result.user);
    return result.user;
  } catch (error: any) {
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      console.warn("Popup blocked, switching to Redirect mode...");
      return await signInWithRedirect(auth, googleProvider);
    }
    
    if (error.code === 'auth/popup-closed-by-user') {
      console.log("User closed the popup manually.");
      return null;
    }

    console.error("Critical Auth Error:", error);
    throw error;
  }
};

/**
 * Processes redirect result on page load
 */
export const handleAuthRedirect = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await syncUserProfile(result.user);
      return result.user;
    }
  } catch (error) {
    console.error("Error processing redirect:", error);
  }
  return null;
};

export const logout = () => signOut(auth);
