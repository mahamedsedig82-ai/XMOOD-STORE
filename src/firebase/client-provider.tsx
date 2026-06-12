
'use client';

import React, { useMemo } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

/**
 * Initializes Firebase services on the client side with singleton pattern.
 */
export function initializeFirebase() {
  const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  // Ensure we only get the firestore instance once per client lifecycle
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  return { firebaseApp, firestore, auth };
}

export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Use useMemo to ensure firebase services are only initialized once on the client
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
