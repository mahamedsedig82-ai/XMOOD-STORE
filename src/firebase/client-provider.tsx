
'use client';

import React, { useEffect } from 'react';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth, firestore, firebaseApp } from './index';
import { FirebaseProvider } from './provider';

/**
 * 🛡️ مزود خدمات Firebase للعميل.
 * تم تحصين الـ Persistence ليعمل فقط في بيئة المتصفح لمنع أخطاء SSR.
 */
export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  useEffect(() => {
    if (typeof window !== 'undefined' && auth) {
      setPersistence(auth, browserLocalPersistence)
        .catch((err) => console.error("[FIREBASE_AUTH] Persistence Guard Failure:", err));
    }
  }, []);

  return (
    <FirebaseProvider 
      firebaseApp={firebaseApp} 
      firestore={firestore} 
      auth={auth}
    >
      {children}
    </FirebaseProvider>
  );
};
