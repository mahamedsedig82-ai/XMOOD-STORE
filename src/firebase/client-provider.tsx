
'use client';

import React, { useMemo, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

/**
 * Initializes Firebase services with a singleton pattern.
 * Persistence is managed inside an effect to prevent SSR crashes.
 */
export function initializeFirebase() {
  const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  return { firebaseApp, firestore, auth };
}

export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const services = useMemo(() => initializeFirebase(), []);

  useEffect(() => {
    // نضبط Persistence فقط في العميل (Client-side) لتجنب أخطاء Hydration
    if (services.auth) {
      setPersistence(services.auth, browserLocalPersistence)
        .catch((err) => console.error("[AUTH] Persistence Error:", err));
    }
  }, [services.auth]);

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
