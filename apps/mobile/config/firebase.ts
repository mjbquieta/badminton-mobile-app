/**
 * Firebase configuration for the mobile app.
 *
 * Values are read from environment variables.
 * Create a .env.local file in apps/mobile/ with your Firebase config.
 * See .env.example for the required variables.
 */
export const firebaseConfig = {
	apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'YOUR_API_KEY',
	authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
	projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
	storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
	messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
	appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};
