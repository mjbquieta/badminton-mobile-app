import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type Auth,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, updateDoc, collection, query, where, serverTimestamp, getFirestore } from 'firebase/firestore';
import { getFirebaseApp } from './config';
import { toTimestampMs } from './timestamp-helpers';

let auth: Auth | null = null;

export function setAuthInstance(instance: Auth): void {
  auth = instance;
}

function getAuthInstance(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export interface RegisterResult {
  user: User;
  verificationEmailSent: boolean;
}

export async function registerUser(
  email: string,
  password: string,
  clubName: string
): Promise<RegisterResult> {
  const db = getFirestore(getFirebaseApp());

  // Check club name uniqueness before creating the auth user
  const clubQuery = query(
    collection(db, 'users'),
    where('clubName', '==', clubName)
  );
  const existing = await getDocs(clubQuery);
  if (!existing.empty) {
    throw { code: 'auth/club-name-taken' };
  }

  const authInstance = getAuthInstance();
  const credential = await createUserWithEmailAndPassword(
    authInstance,
    email,
    password
  );
  const user = credential.user;

  await setDoc(doc(db, 'users', user.uid), {
    email,
    clubName,
    role: 'player',
    createdAt: serverTimestamp(),
  });

  let verificationEmailSent = false;
  try {
    await sendEmailVerification(user);
    verificationEmailSent = true;
  } catch (e) {
    console.warn('Failed to send verification email:', e);
  }

  return { user, verificationEmailSent };
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
      case 'auth/club-name-taken':
        return 'This club name is already taken. Please choose a different one.';
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
      case 'auth/requires-recent-login':
        return 'Please sign out and sign back in, then try again.';
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

export interface UserProfile {
  email: string;
  clubName: string;
  role: 'admin' | 'player';
  createdAt: number | null;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirestore(getFirebaseApp());
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    email: data.email as string,
    clubName: data.clubName as string,
    role: (data.role as 'admin' | 'player') ?? 'player',
    createdAt: toTimestampMs(data.createdAt),
  };
}

export async function sendVerificationEmail(user: User): Promise<void> {
  await sendEmailVerification(user);
}

export async function reloadUser(user: User): Promise<void> {
  await user.reload();
}

export async function updateUserPassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const authInstance = getAuthInstance();
  const user = authInstance.currentUser;
  if (!user || !user.email) throw new Error('No user logged in');

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await firebaseUpdatePassword(user, newPassword);
}

export async function updateUserClubName(
  uid: string,
  newClubName: string
): Promise<void> {
  const db = getFirestore(getFirebaseApp());

  const clubQuery = query(
    collection(db, 'users'),
    where('clubName', '==', newClubName)
  );
  const existing = await getDocs(clubQuery);
  const taken = existing.docs.some((d) => d.id !== uid);
  if (taken) {
    throw { code: 'auth/club-name-taken' };
  }

  await updateDoc(doc(db, 'users', uid), { clubName: newClubName });
}

export async function updateUserRole(
  uid: string,
  role: 'admin' | 'player'
): Promise<void> {
  const db = getFirestore(getFirebaseApp());
  await updateDoc(doc(db, 'users', uid), { role });
}

export type { User } from 'firebase/auth';
