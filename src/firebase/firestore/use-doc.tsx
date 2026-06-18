'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  DocumentReference, 
  onSnapshot, 
  DocumentSnapshot, 
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * 🛡️ Safety-Enhanced Document Hook 5.0
 * حماية ميكانيكية ضد تعارض الحالات أثناء التنقل بين الصفحات
 */
export function useDoc<T = DocumentData>(docRef: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    // إغلاق المستمع السابق فوراً
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!docRef) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const unsubscribe = onSnapshot(
        docRef, 
        (snapshot: DocumentSnapshot<T>) => {
          setData(snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as T : null);
          setLoading(false);
        }, 
        (serverError) => {
          if (serverError.code !== 'permission-denied') {
            const permissionError = new FirestorePermissionError({
              path: docRef.path,
              operation: 'get',
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
          }
          setError(serverError);
          setLoading(false);
        }
      );

      unsubscribeRef.current = unsubscribe;
    } catch (e) {
      console.error("[FIRESTORE_DOC] Error:", e);
      setLoading(false);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [docRef?.path]); // الاعتماد على المسار لضمان الاستقرار

  return { data, loading, error };
}
