'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * 🛡️ Firebase Sovereign Engine 19.0 (Strict Singleton Guard)
 * تحصين المحرك ضد التهيئة المزدوجة التي يسببها Next.js 15 Turbopack.
 * هذا الملف هو المصدر الوحيد والنهائي لكافة خدمات Firebase في المشروع.
 */
let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

if (getApps().length > 0) {
  app = getApp();
} else {
  app = initializeApp(firebaseConfig);
}

firestore = getFirestore(app);
auth = getAuth(app);

export { app as firebaseApp, firestore, auth };

// تصدير الأدوات والخطافات المحصنة بنظام الـ Refs
export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './utils/use-memo-firebase';
