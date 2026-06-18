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
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * 🛡️ Sovereign Document Hook 20.0 (Strict Lifecycle Management)
 * Prevents assertion errors by enforcing physical cleanup of onSnapshot.
 */
export function useDoc<T = DocumentData>(docRef: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!docRef) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const unsubscribe = onSnapshot(
        docRef, 
        (snapshot: DocumentSnapshot<T>) => {
          setData(snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as T : null);
          setLoading(false);
          setError(null);
        }, 
        (serverError) => {
          if (serverError.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'get' }));
          }
          setError(serverError);
          setLoading(false);
        }
      );

      unsubscribeRef.current = unsubscribe;
    } catch (e: any) {
      setError(e);
      setLoading(false);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [docRef?.path]);

  return { data, loading, error };
}
