
'use client';

import React, { useMemo, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

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
    // التفعيل فقط في بيئة المتصفح لتجنب أخطاء SSR
    if (services.auth && typeof window !== 'undefined') {
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
