'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, terminate } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * 🛡️ Singleton Firebase Engine 3.0
 * يضمن تهيئة واحدة فقط لمنع خطأ INTERNAL ASSERTION FAILED.
 */
let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

if (getApps().length > 0) {
  app = getApp();
} else {
  app = initializeApp(firebaseConfig);
}

// 🔐 تهيئة الخدمات بنظام الـ Singleton المستقر
firestore = getFirestore(app);
auth = getAuth(app);

export { app as firebaseApp, firestore, auth };

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './utils/use-memo-firebase';
