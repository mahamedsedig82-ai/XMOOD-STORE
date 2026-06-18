'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

// 🛡️ Singleton Pattern with Connectivity Shield
let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

if (getApps().length > 0) {
  app = getApp();
} else {
  app = initializeApp(firebaseConfig);
}

/**
 * تحصين Firestore ضد الانهيارات المتكررة وتهيئة الاتصال المستقر.
 * experimentalForceLongPolling يضمن الاتصال في البيئات المقيدة والشبكات الضعيفة.
 */
firestore = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

auth = getAuth(app);

export { app as firebaseApp, firestore, auth };

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './utils/use-memo-firebase';