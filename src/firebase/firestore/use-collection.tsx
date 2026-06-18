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
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * 🛡️ Safety-Enhanced Collection Hook
 * تم تزويده بحواجز أمان تمنع تسرب المستمعات بعد خروج المستخدم، مما يحل مشكلة تراكم الأخطاء.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    // 1. تنظيف استباقي لأي مستمع نشط
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!query) {
      setLoading(false);
      return;
    }

    // 2. بدء المستمع مع آلية تنظيف صارمة
    const unsubscribe = onSnapshot(
      query, 
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        setData(items);
        setLoading(false);
      }, 
      (serverError) => {
        // 🛡️ إذا فقد المستخدم هويته، نتوقف صمتاً لتجنب إزعاج الواجهة
        if (!auth.currentUser) {
          setLoading(false);
          return;
        }

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

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [query]); 

  return { data, loading, error };
}
