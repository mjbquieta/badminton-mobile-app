import { type FirebaseConfig } from '@badminton/firebase';

/**
 * Firebase configuration for the web app.
 *
 * To set up:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project (or use the same one as mobile)
 * 3. Add a Web App to the project
 * 4. Copy the config values below
 * 5. Enable Firestore in the Firebase console
 */
export const firebaseConfig: FirebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.firebasestorage.app',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
