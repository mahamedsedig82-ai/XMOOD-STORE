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
 * 🛡️ Safety-Enhanced Collection Hook 3.0
 * تم تزويده بحواجز أمان تمنع تشغيل المستمعات بدون مستخدم نشط.
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

    // 🛡️ Guard: لا يسمح بتشغيل المستمع إذا لم يكن هناك مستخدم مسجل (إصلاح b815/ca9)
    if (!query || !auth.currentUser) {
      setLoading(false);
      setData([]);
      return;
    }

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
        }, 
        (serverError) => {
          // 🛡️ إذا فقد المستخدم هويته أثناء الاستماع، نتوقف صمتاً
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
    } catch (e) {
      console.error("[FIRESTORE_HOOK] Runtime Guard:", e);
      setLoading(false);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [query, auth.currentUser?.uid]); // الربط بـ UID لضمان التحديث عند تغير الجلسة

  return { data, loading, error };
}
