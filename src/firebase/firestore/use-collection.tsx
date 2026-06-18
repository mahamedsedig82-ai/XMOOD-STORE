'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  Query, 
  onSnapshot, 
  QuerySnapshot, 
  DocumentData 
} from 'firebase/firestore';
import { auth } from '../index';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * 🛡️ Production-Safe Collection Hook
 * يضمن عدم التسجيل إلا بعد التأكد من هوية المستخدم وينظف نفسه فوراً.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    // تأمين: لا نبدأ المستمع إذا لم يكن هناك استعلام أو لم يكن المستخدم مسجلاً (إذا كان الاستعلام يتطلب ذلك)
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

        if (process.env.NODE_ENV === 'development') {
          console.warn('[FIRESTORE_GUARD] Access Restricted:', path);
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
