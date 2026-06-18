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
 * 🛡️ Strict-Cleanup Collection Hook 6.0
 * حل جذري ونهائي لخطأ INTERNAL ASSERTION عبر إدارة فيزيائية صارمة للـ Unsubscribe
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // استخدام Ref كحاوية مغلقة تضمن عدم تكرار المستمعات نهائياً
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    // 1. القتل الفوري لأي مستمع نشط قبل البدء بإنشاء مستمع جديد
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
          // معالجة أخطاء الصلاحيات بهدوء
          if (serverError.code === 'permission-denied') {
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

      // تخزين دالة الإغلاق في الـ Ref للوصول إليها في دورة التنظيف القادمة
      unsubscribeRef.current = unsubscribe;
    } catch (e) {
      console.error("[FIRESTORE_SAFE_COLLECTION] Fatal Snap Error");
      setLoading(false);
    }

    // 2. ضمان التنظيف القسري عند مغادرة الصفحة أو تغيير الاستعلام
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null; // تصفير المرجع لمنع محاولات الإغلاق المزدوج
      }
    };
  }, [query]); 

  return { data, loading, error };
}
