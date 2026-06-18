'use client';

import { useEffect, useState } from 'react';
import { 
  DocumentReference, 
  onSnapshot, 
  DocumentSnapshot, 
  DocumentData 
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * خطاف صامت لمراقبة الوثائق دون إصدار تنبيهات أمان مزعجة للمستخدم.
 */
export function useDoc<T = DocumentData>(docRef: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!docRef) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onSnapshot(
        docRef, 
        (snapshot: DocumentSnapshot<T>) => {
          if (!isMounted) return;
          setData(snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as T : null);
          setLoading(false);
        }, 
        (serverError) => {
          if (!isMounted) return;
          
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'get',
          } satisfies SecurityRuleContext);

          // إرسال الخطأ بصمت للمعالجة الخلفية فقط
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
      if (isMounted) setLoading(false);
    }
  }, [docRef?.path]);

  return { data, loading, error };
}