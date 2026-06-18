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
 * 🛡️ Safety-Enhanced Collection Hook 4.0
 * تم السماح بالاستماع للبيانات العامة حتى بدون مستخدم مسجل.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // 🛡️ Guard: فقط نمنع إذا لم يوجد استعلام أصلاً
    if (!query) {
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
          // 🛡️ معالجة هادئة لأخطاء الصلاحيات (خاصة عند Logout)
          const path = (query as any)._query?.path?.toString() || 'collection';
          
          if (serverError.code === 'permission-denied') {
            console.warn(`[FIRESTORE_GUARD] Access denied to path: ${path}`);
          } else {
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
      console.error("[FIRESTORE_HOOK] Runtime Guard:", e);
      setLoading(false);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [query, auth.currentUser?.uid]); 

  return { data, loading, error };
}
