'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * مراقب أخطاء صامت لضمان تجربة مستخدم فاخرة.
 * تم إلغاء كافة التنبيهات المزعجة (Toasts) الخاصة بالصلاحيات لضمان سلاسة التصفح.
 * الأخطاء تسجل في سجلات المطورين فقط للتدقيق الفني.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // تسجيل صامت في الكونسول للمطورين فقط
      if (process.env.NODE_ENV === 'development') {
        const context = error.context || {};
        console.group('🛡️ XMOOD FIREWALL: SILENT LOG');
        console.warn('Path Restricted:', context.path || 'Unknown');
        console.warn('Operation:', context.operation || 'Unknown');
        console.groupEnd();
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
