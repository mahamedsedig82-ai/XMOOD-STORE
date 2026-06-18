'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  DocumentReference, 
  onSnapshot, 
  DocumentSnapshot, 
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';
import { auth } from '../index';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * 🛡️ Sovereign Document Hook 22.0 (Assertion-Proof)
 * Strictly manages individual document listeners with mandatory physical cleanup.
 */
export function useDoc<T = DocumentData>(docRef: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    // 1. Pre-Flight Cleanup
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // 2. Security Guard
    if (!docRef || !auth.currentUser) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const unsubscribe = onSnapshot(
        docRef, 
        (snapshot: DocumentSnapshot<T>) => {
          // Prevent processing data if auth was lost during transit
          if (!auth.currentUser) return;

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
  }, [docRef?.path]); // Depend on path to avoid re-subscribing on reference changes

  return { data, loading, error };
}
