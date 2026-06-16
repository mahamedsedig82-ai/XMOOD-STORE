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
 * مزامنة ملف المستخدم: تضمن وجود مستند للمستخدم في Firestore فور الدخول.
 * تم جعلها Idempotent لمنع التكرار.
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
      console.log("[AUTH-DEBUG] تم إنشاء ملف شخصي جديد بنجاح.");
    } else {
      await setDoc(userRef, { 
        lastSeen: new Date().toISOString(),
        updatedAt: serverTimestamp() 
      }, { merge: true });
      console.log("[AUTH-DEBUG] تم تحديث وقت النشاط.");
    }
  } catch (error) {
    console.error("[AUTH-DEBUG] خطأ في مزامنة Firestore:", error);
  }
}

/**
 * دخول جوجل الذكي:
 * يستخدم Redirect فوراً في الهواتف، و Popup في الحاسوب مع Fallback.
 */
export const loginWithGoogle = async () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    console.log("[AUTH-DEBUG] بيئة هاتف: بدء إعادة التوجيه (Redirect)...");
    return await signInWithRedirect(auth, googleProvider);
  }

  try {
    console.log("[AUTH-DEBUG] بيئة حاسوب: محاولة فتح نافذة (Popup)...");
    const result = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(result.user);
    return result.user;
  } catch (error: any) {
    console.warn("[AUTH-DEBUG] تعذر فتح النافذة، التحويل لـ Redirect. الكود:", error.code);
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      return await signInWithRedirect(auth, googleProvider);
    }
    throw error;
  }
};

/**
 * معالج العودة: يلتقط النتيجة بعد إعادة التوجيه من جوجل.
 */
export const handleAuthRedirect = async () => {
  try {
    console.log("[AUTH-DEBUG] فحص نتائج إعادة التوجيه...");
    const result = await getRedirectResult(auth);
    if (result?.user) {
      console.log("[AUTH-DEBUG] نجاح العودة من جوجل لـ:", result.user.email);
      await syncUserProfile(result.user);
      return result.user;
    }
  } catch (error) {
    console.error("[AUTH-DEBUG] خطأ في معالجة العودة:", error);
  }
  return null;
};

export const logout = () => signOut(auth);
