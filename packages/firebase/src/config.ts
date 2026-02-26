import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

let app: FirebaseApp | null = null;

export function initializeFirebase(config: FirebaseConfig): FirebaseApp {
  if (getApps().length > 0) {
    app = getApps()[0];
    return app;
  }

  app = initializeApp(config);
  return app;
}

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    throw new Error(
      'Firebase not initialized. Call initializeFirebase(config) first.'
    );
  }
  return app;
}

export async function enableOfflinePersistence(
  options?: { multiTab?: boolean },
): Promise<void> {
  const db = getFirestore(getFirebaseApp());
  try {
    if (options?.multiTab) {
      await enableMultiTabIndexedDbPersistence(db);
    } else {
      await enableIndexedDbPersistence(db);
    }
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err) {
      const code = (err as { code: string }).code;
      if (code === 'failed-precondition') {
        console.warn('[firebase] Persistence failed: multiple tabs open');
      } else if (code === 'unimplemented') {
        console.warn('[firebase] Persistence not available in this environment');
      }
    }
  }
}
