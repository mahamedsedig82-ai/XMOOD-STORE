'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * 🛡️ Firebase Sovereign Singleton Engine 22.0
 * strictly prevents multiple initializations even during Turbopack hot reloads.
 */
let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

firestore = getFirestore(app);
auth = getAuth(app);

export { app as firebaseApp, firestore, auth };

// Centralized exports for system-wide stability
export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './utils/use-memo-firebase';
