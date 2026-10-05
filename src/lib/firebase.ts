import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Default configuration for project star-agent-jpf
// Environment variables can override any of these fields
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (typeof window !== 'undefined' ? (window as any).__FIREBASE_API_KEY__ : '') || '',
  authDomain: "star-agent-jpf.firebaseapp.com",
  projectId: "star-agent-jpf",
  storageBucket: "star-agent-jpf.firebasestorage.app",
  messagingSenderId: "531307346524",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (app) return app;
  if (!isFirebaseConfigured()) return null;

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      app = existingApps[0];
    } else if (firebaseConfig.apiKey) {
      app = initializeApp(firebaseConfig);
    }
    return app;
  } catch (err) {
    console.warn('[Firebase] App initialization skipped or failed:', err);
    return null;
  }
}

export function getFirestoreDb(): Firestore | null {
  if (db) return db;
  const currentApp = getFirebaseApp();
  if (!currentApp) return null;

  try {
    db = getFirestore(currentApp);
    return db;
  } catch (err) {
    console.warn('[Firestore] Database initialization skipped or failed:', err);
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  const currentApp = getFirebaseApp();
  return currentApp ? getAuth(currentApp) : null;
}

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.appId && firebaseConfig.projectId);
}

export function isFirestoreConfigured(): boolean {
  return isFirebaseConfigured();
}

export { firebaseConfig };
