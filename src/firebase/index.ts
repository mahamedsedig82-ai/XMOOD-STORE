'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, initializeFirestore, enableIndexedDbPersistence, terminate } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

// 🛡️ Singleton Pattern with Immunity Shield V11.0
let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

if (getApps().length > 0) {
  app = getApp();
} else {
  app = initializeApp(firebaseConfig);
}

/**
 * تحصين Firestore ضد أخطاء Assertion المزدوجة.
 * نستخدم try-catch مع فحص الحالة لضمان تهيئة واحدة مستقرة.
 */
try {
  // محاولة الوصول للنسخة الحالية أولاً
  firestore = getFirestore(app);
} catch (e) {
  // إذا لم تكن موجودة، نقوم بتهيئتها بخصائص محسنة
  firestore = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
}

auth = getAuth(app);

export { app as firebaseApp, firestore, auth };

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './utils/use-memo-firebase';
