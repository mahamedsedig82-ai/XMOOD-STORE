
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // In development, Next.js will catch uncaught errors and show the overlay.
      // We throw it here so the developer sees the rich context if available.
      if (process.env.NODE_ENV === 'development') {
        console.error('Firestore Permission Error Context:', error.context);
      }

      toast({
        variant: 'destructive',
        title: 'خطأ في الصلاحيات',
        description: 'ليس لديك الإذن الكافي لإتمام هذه العملية. يرجى التواصل مع الإدارة إذا كنت تعتقد أن هذا خطأ.',
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
