'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  Query, 
  onSnapshot, 
  QuerySnapshot, 
  DocumentData 
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * 🛡️ خطاف سيادي محصن ضد الـ Assertion والـ Memory Leaks.
 * تم تحسينه ليناسب Next.js 15 ومنع خطأ INTERNAL ASSERTION FAILED.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    if (!query) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query, 
      (snapshot: QuerySnapshot<T>) => {
        if (!isMounted.current) return;
        const items = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        setData(items);
        setLoading(false);
      }, 
      (serverError) => {
        if (!isMounted.current) return;
        
        const path = (query as any)._query?.path?.toString() || 'collection';
        const permissionError = new FirestorePermissionError({
          path,
          operation: 'list',
        } satisfies SecurityRuleContext);

        // تسجيل صامت في الكونسول للمطورين فقط
        if (process.env.NODE_ENV === 'development') {
          console.warn('🛡️ Firestore Access Restricted:', path);
        }
        
        errorEmitter.emit('permission-error', permissionError);
        setError(serverError);
        setLoading(false);
      }
    );

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, [query]); 

  return { data, loading, error };
}
