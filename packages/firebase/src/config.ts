import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';

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
