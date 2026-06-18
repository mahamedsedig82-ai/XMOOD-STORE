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
 * 🛡️ Profile Sync Service 6.0 (Race-Condition Guarded)
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
      if (existing.isVerified !== user.emailVerified) {
        await updateDoc(userRef, { 
          isVerified: user.emailVerified,
          updatedAt: serverTimestamp() 
        });
      }
    }
  } catch (error) {
    // Silent catch for background syncs to prevent crashing the UI
  }
}

/**
 * 🛡️ Sovereign Wipe Logout (STRICT ATOMIC ORDER)
 * 1. Clear State (Implicit via useUser effect)
 * 2. Wipe Local Cache
 * 3. Await SignOut
 * 4. Hard Redirect
 */
export const logout = async () => {
  if (!auth) return;
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('xmood-cart');
      localStorage.removeItem('xmood-theme');
      sessionStorage.clear();
    }
    
    // The useUser hook's useEffect will catch the auth change and kill listeners.
    await signOut(auth);
    
    // Final hard reset to ensure no corrupted state remains
    window.location.href = '/login';
  } catch (error) {
    window.location.href = '/login';
  }
};

/**
 * 🛡️ Google Auth Bridge
 */
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
