'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  Query, 
  onSnapshot, 
  QuerySnapshot, 
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * 🛡️ Sovereign Collection Hook 20.0 (Strict Lifecycle Management)
 * Uses physical useRef tracking to ensure absolute cleanup and prevent Firestore Internal Assertions.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Physical reference to the active subscription to prevent overlapping
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    // 1. Forcefully kill any existing listener before starting a new one
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const unsubscribe = onSnapshot(
        query, 
        (snapshot: QuerySnapshot<T>) => {
          const items = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          } as T));
          setData(items);
          setLoading(false);
          setError(null);
        }, 
        (serverError) => {
          if (serverError.code === 'permission-denied') {
            const path = (query as any)._query?.path?.toString() || 'collection';
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path, operation: 'list' }));
          }
          setError(serverError);
          setLoading(false);
        }
      );

      // Store the new unsubscription function
      unsubscribeRef.current = unsubscribe;
    } catch (e: any) {
      setError(e);
      setLoading(false);
    }

    // 2. Final cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [query]); 

  return { data, loading, error };
}
