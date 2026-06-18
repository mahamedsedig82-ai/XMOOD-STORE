'use client';

import React, { useEffect } from 'react';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth, firestore, firebaseApp } from './index';
import { FirebaseProvider } from './provider';

export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  useEffect(() => {
    // 🛡️ التفعيل فقط في بيئة المتصفح لمنع أخطاء SSR والـ Persistence
    if (typeof window !== 'undefined' && auth) {
      setPersistence(auth, browserLocalPersistence)
        .catch((err) => console.error("[AUTH] Persistence Error:", err));
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
