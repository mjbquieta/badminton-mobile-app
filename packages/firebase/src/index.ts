export type { FirebaseConfig } from './config';
export { initializeFirebase, getFirebaseApp } from './config';

export type { SessionData } from './firestore';
export {
  createSession,
  getSession,
  updateSessionPlayers,
  updateSessionCourts,
  updateSessionQueue,
  updateSessionFull,
  subscribeToSession,
} from './firestore';

export type { SyncableStore, FirebaseSyncOptions } from './sync';
export { createFirebaseSync } from './sync';

export type { User, UserProfile } from './auth';
export {
  registerUser,
  loginUser,
  signOut,
  subscribeToAuthState,
  getAuthErrorMessage,
  getUserProfile,
} from './auth';
