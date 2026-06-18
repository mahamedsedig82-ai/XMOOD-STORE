
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

/**
 * مراقب أخطاء Firebase المركزي.
 * يقوم برصد وعرض تفاصيل أخطاء الصلاحيات والـ Assertion بشكل احترافي.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      if (process.env.NODE_ENV === 'development') {
        const context = error.context || {};
        console.group('🛡️ XMOOD FIREWALL: ACCESS DENIED');
        console.error('Path:', context.path || 'Unknown');
        console.error('Operation:', context.operation || 'Unknown');
        console.error('Full Error Object:', error);
        console.groupEnd();
      }

      toast({
        variant: 'destructive',
        title: 'بروتوكول الأمان: وصول مقيد',
        description: 'عذراً سيادة المدير/العضو، ليس لديك الإذن الكافي لإجراء هذه العملية. تم تسجيل هذا الحدث في سجلات الأمان.',
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
