
"use client";

/**
 * @fileOverview Firebase Proxy - Redirects to central firebase index to prevent double-initialization.
 * 🛡️ تحصين ضد خطأ INTERNAL ASSERTION FAILED عبر منع تعدد النسخ.
 */
import { auth as centralAuth, firestore as centralFirestore, firebaseApp as centralApp } from "@/firebase";

export const auth = centralAuth;
export const db = centralFirestore;
export const app = centralApp;
