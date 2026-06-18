'use client';

import { useEffect, useState } from 'react';
import { 
  Query, 
  onSnapshot, 
  QuerySnapshot, 
  DocumentData 
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * خطاف سيادي لمراقبة المجموعات مع نظام معالجة أخطاء متقدم وتحصين ضد الـ Assertion.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!query) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onSnapshot(
        query, 
        (snapshot: QuerySnapshot<T>) => {
          if (!isMounted) return;
          const items = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          }));
          setData(items);
          setLoading(false);
        }, 
        (serverError) => {
          if (!isMounted) return;
          
          // Safe path extraction
          const path = (query as any)._query?.path?.toString() || 'collection';
          
          const permissionError = new FirestorePermissionError({
            path,
            operation: 'list',
          } satisfies SecurityRuleContext);

          errorEmitter.emit('permission-error', permissionError);
          setError(serverError);
          setLoading(false);
        }
      );

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch (e: any) {
      if (isMounted) {
        console.error("[useCollection] Listener Setup Failed:", e);
        setLoading(false);
      }
    }
  }, [query]); // Note: query stability is managed by useMemoFirebase in components

  return { data, loading, error };
}