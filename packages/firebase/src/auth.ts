import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type Auth,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { getFirebaseApp } from './config';

let auth: Auth | null = null;

function getAuthInstance(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export async function registerUser(
  email: string,
  password: string,
  clubName: string
): Promise<User> {
  const authInstance = getAuthInstance();
  const credential = await createUserWithEmailAndPassword(
    authInstance,
    email,
    password
  );
  const user = credential.user;

  const db = getFirestore(getFirebaseApp());
  await setDoc(doc(db, 'users', user.uid), {
    email,
    clubName,
    createdAt: serverTimestamp(),
  });

  return user;
}

export async function loginUser(
  email: string,
  password: string
): Promise<User> {
  const authInstance = getAuthInstance();
  const credential = await signInWithEmailAndPassword(
    authInstance,
    email,
    password
  );
  return credential.user;
}

export async function signOut(): Promise<void> {
  const authInstance = getAuthInstance();
  await firebaseSignOut(authInstance);
}

export function subscribeToAuthState(
  onUser: (user: User | null) => void
): Unsubscribe {
  const authInstance = getAuthInstance();
  return onAuthStateChanged(authInstance, onUser);
}

export function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 8 characters.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
  return 'An unexpected error occurred. Please try again.';
}

export type { User } from 'firebase/auth';
