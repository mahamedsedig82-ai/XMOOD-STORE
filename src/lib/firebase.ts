'use client';

/**
 * @fileOverview Firebase Proxy.
 * 🛡️ تحصين قاطع ضد خطأ INTERNAL ASSERTION FAILED عبر منع تهيئة التطبيق مرتين.
 * يوجه كافة الاستدعاءات إلى النسخة المركزية الموحدة في @/firebase.
 */
import { auth as centralAuth, firestore as centralFirestore, firebaseApp as centralApp } from "@/firebase";

export const auth = centralAuth;
export const db = centralFirestore;
export const app = centralApp;
