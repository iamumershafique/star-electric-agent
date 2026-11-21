import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Production defaults; explicit Vite variables allow an isolated test project.
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'star-agent-jpf';
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (typeof window !== 'undefined' ? (window as any).__FIREBASE_API_KEY__ : '') || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (projectId === 'star-agent-jpf' ? '531307346524' : ''),
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  // Demo delivery uses its own fixed loopback-only app; never initialize the portal app.
  if (import.meta.env.VITE_LINKED_DELIVERY_DEMO === 'true') return null;
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
  if (import.meta.env.VITE_LINKED_DELIVERY_DEMO === 'true') return null;
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
  if (import.meta.env.VITE_LINKED_DELIVERY_DEMO === 'true') return false;
  return Boolean(firebaseConfig.apiKey && firebaseConfig.appId && firebaseConfig.projectId);
}

export function isFirestoreConfigured(): boolean {
  return isFirebaseConfigured();
}

export { firebaseConfig };
