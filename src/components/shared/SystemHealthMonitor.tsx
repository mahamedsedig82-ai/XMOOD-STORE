
'use client';

import { useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * نظام معالجة واكتشاف الأخطاء الدوري.
 * يقوم بفحص سلامة الجلسة وتسجيل الأحداث الأمنية لضمان "التتبع" المستمر.
 */
export function SystemHealthMonitor() {
  const { user, profile } = useUser();
  const db = useFirestore();

  useEffect(() => {
    if (!user || !db) return;

    // تسجيل "نبض النظام" دورياً لضمان تتبع حالة النشاط
    const heartbeat = setInterval(() => {
      const logRef = doc(db, 'system_heartbeats', user.uid);
      setDoc(logRef, {
        lastActive: serverTimestamp(),
        email: user.email,
        status: 'online'
      }, { merge: true }).catch(() => {
        // فشل صامت لعدم إزعاج المستخدم، النظام سيحاول مجدداً
      });
    }, 60000); // كل دقيقة

    return () => clearInterval(heartbeat);
  }, [user, db]);

  return null; // مكون غير مرئي يعمل في الخلفية
}
