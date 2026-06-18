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
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * 🛡️ Sovereign Collection Hook 19.0 (Anti-Assertion Pattern)
 * يستخدم نظام الـ Unsubscribe Ref لضمان استقرار Firestore ومنع انهيار الـ SDK.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    // 1. القتل العمد لأي مستمع نشط قبل البدء بجديد لمنع التعارض
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const unsubscribe = onSnapshot(
        query, 
        (snapshot: QuerySnapshot<T>) => {
          const items = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          } as T));
          setData(items);
          setLoading(false);
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
    } catch (e) {
      setLoading(false);
    }

    // 2. ضمان التنظيف الكامل عند unmount أو تغيير الـ Query
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [query]); 

  return { data, loading, error };
}
