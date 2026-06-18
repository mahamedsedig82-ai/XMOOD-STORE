'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * مراقب أخطاء صامت لضمان تجربة مستخدم فاخرة.
 * تم إلغاء البروتوكولات المزعجة والاكتفاء بتسجيل الأخطاء للتدقيق الفني فقط.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // تسجيل صامت في الكونسول للمطورين فقط
      if (process.env.NODE_ENV === 'development') {
        console.warn('🛡️ XMOOD AUTH: Resource restricted or missing.', error.context?.path);
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}