"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtPvqa1t5GVWWqFzKY8S9kDlo241fhvNA",
  authDomain: "xmood-36c92.firebaseapp.com",
  projectId: "xmood-36c92",
  storageBucket: "xmood-36c92.appspot.com",
  messagingSenderId: "977561332302",
  appId: "1:977561332302:web:6320d06bf266f26b8eb11f",
  measurementId: "G-DS0CPFRDSY"
};

// Initialize Firebase (Singleton pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Standardize Provider config
googleProvider.setCustomParameters({ prompt: 'select_account' });
