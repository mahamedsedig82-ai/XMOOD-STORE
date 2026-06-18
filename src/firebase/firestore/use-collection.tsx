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
 * 🛡️ Safety-Enhanced Collection Hook 5.0
 * إصلاح جذري لمنع خطأ INTERNAL ASSERTION عبر إدارة صارمة للـ Unsubscribe
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // استخدام Ref لضمان تتبع المستمع الحالي وإغلاقه بدقة
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    // 1. تنظيف أي مستمع قديم فوراً قبل البدء
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
          // معالجة هادئة لأخطاء الصلاحيات
          if (serverError.code !== 'permission-denied') {
            const path = (query as any)._query?.path?.toString() || 'collection';
            const permissionError = new FirestorePermissionError({
              path,
              operation: 'list',
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
          }
          setError(serverError);
          setLoading(false);
        }
      );

      unsubscribeRef.current = unsubscribe;
    } catch (e) {
      console.error("[FIRESTORE_COLLECTION] Error:", e);
      setLoading(false);
    }

    // 2. ضمان التنظيف عند الـ Unmount أو تغيير الـ Query
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [query]); // التغيير يعتمد فقط على المرجع المستقر للـ Query

  return { data, loading, error };
}
