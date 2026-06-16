
'use client';

import React, { useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

/**
 * Initializes Firebase services on the client side with singleton pattern.
 * Sets global persistence to ensure stable session management.
 */
export function initializeFirebase() {
  console.log("[AUTH-DEBUG] Initializing Firebase Core...");
  const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  // Set persistence once globally at initialization to avoid popup conflicts
  setPersistence(auth, browserLocalPersistence)
    .then(() => console.log("[AUTH-DEBUG] Persistence set to browserLocalPersistence"))
    .catch((err) => {
      console.error("[AUTH-DEBUG] Auth Persistence Error:", err);
    });

  return { firebaseApp, firestore, auth };
}

export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const services = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider 
      firebaseApp={services.firebaseApp} 
      firestore={services.firestore} 
      auth={services.auth}
    >
      {children}
    </FirebaseProvider>
  );
};
