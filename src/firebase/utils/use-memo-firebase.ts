'use client';

import { useMemo, DependencyList } from 'react';

/**
 * خطاف مخصص لضمان استقرار مراجع Firestore (Collection/Doc/Query)
 * يمنع حلقات التكرار اللانهائية عند استخدام useCollection أو useDoc.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  return useMemo(factory, deps);
}
