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
 * 🛡️ REBUILT REGISTRATION FLOW (39.0)
 * Hard enforcement of email string integrity and order.
 */
export const registerEmail = async (rawEmail: string, pass: string, name: string) => {
  // 1. Mandatory Traceability
  console.log("--- AUTH REGISTRATION START ---");
  console.log("INPUT NAME:", name);
  
  // 2. SINGLE SOURCE OF TRUTH SANITIZATION
  const cleanEmail = String(rawEmail)
    .trim()
    .toLowerCase()
    .replace(/\s/g, "");

  console.log("CLEAN EMAIL FOR FIREBASE:", cleanEmail);
  console.log("CLEAN EMAIL LENGTH:", cleanEmail.length);

  // 3. STRICT TYPE SAFETY ENFORCEMENT
  if (!cleanEmail || typeof cleanEmail !== 'string' || !cleanEmail.includes('@')) {
    console.error("INVALID EMAIL AT BOUNDARY:", cleanEmail);
    throw new Error("تنسيق البريد الإلكتروني غير صالح للإرسال.");
  }

  try {
    // 4. ATOMIC FIREBASE CALL
    console.log("CALLING FIREBASE: createUserWithEmailAndPassword");
    const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    
    // 5. IMMEDIATE PROFILE SYNC
    console.log("AUTH SUCCESS. UPDATING PROFILE...");
    await updateProfile(res.user, { displayName: name });
    await syncUserProfile(res.user, { displayName: name });
    
    console.log("--- AUTH REGISTRATION COMPLETE ---");
    return res;
  } catch (error) {
    console.error("FIREBASE AUTH ERROR:", error);
    throw error;
  }
};

/**
 * 🛡️ REBUILT LOGIN PIPELINE (39.0)
 */
export const loginEmail = async (rawEmail: string, pass: string) => {
  console.log("--- AUTH LOGIN START ---");
  
  const cleanEmail = String(rawEmail)
    .trim()
    .toLowerCase()
    .replace(/\s/g, "");

  console.log("CLEAN LOGIN EMAIL:", cleanEmail);

  if (!cleanEmail || typeof cleanEmail !== 'string') {
    throw new Error("يرجى إدخال بريد إلكتروني صحيح.");
  }

  try {
    return await signInWithEmailAndPassword(auth, cleanEmail, pass);
  } catch (error) {
    console.error("LOGIN FAILURE:", error);
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
