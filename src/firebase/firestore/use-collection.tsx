'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  Query, 
  onSnapshot, 
  QuerySnapshot, 
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';
import { auth } from '../index';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * 🛡️ Sovereign Collection Hook 22.0 (Assertion-Proof)
 * Uses Ref-Shielded logic to ensure physical listener cleanup and prevent internal state corruption.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Physical tracker for the listener
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    // 1. Mandatory Pre-Flight: Kill any existing listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // 2. Auth Guard: Do not attempt query if user is not authenticated
    if (!query || !auth.currentUser) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      // 3. Establish Ref-Shielded Subscription
      const unsubscribe = onSnapshot(
        query, 
        (snapshot: QuerySnapshot<T>) => {
          // Double check auth inside callback to prevent processing data after logout race
          if (!auth.currentUser) return;

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

      unsubscribeRef.current = unsubscribe;
    } catch (e: any) {
      setError(e);
      setLoading(false);
    }

    // 4. Physical Cleanup on Unmount or Query Change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [query]); // Query is stabilized by useMemoFirebase in components

  return { data, loading, error };
}
