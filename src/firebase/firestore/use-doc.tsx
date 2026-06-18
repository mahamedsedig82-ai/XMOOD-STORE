'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  DocumentReference, 
  onSnapshot, 
  DocumentSnapshot, 
  DocumentData 
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * 🛡️ Production-Safe Document Hook
 * يراقب الوثائق بصمت مع ضمان التنظيف الكامل عند الخروج.
 */
export function useDoc<T = DocumentData>(docRef: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    if (!docRef) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      docRef, 
      (snapshot: DocumentSnapshot<T>) => {
        if (!isMounted.current) return;
        setData(snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as T : null);
        setLoading(false);
      }, 
      (serverError) => {
        if (!isMounted.current) return;
        
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        } satisfies SecurityRuleContext);

        errorEmitter.emit('permission-error', permissionError);
        setError(serverError);
        setLoading(false);
      }
    );

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, [docRef?.path]);

  return { data, loading, error };
}
