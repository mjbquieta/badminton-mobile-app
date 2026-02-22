export type { FirebaseConfig } from './config';
export { initializeFirebase, getFirebaseApp } from './config';

export type { SessionData } from './firestore';
export {
  createSession,
  getSession,
  updateSessionPlayers,
  updateSessionCourts,
  updateSessionDrafts,
  updateSessionFull,
  subscribeToSession,
} from './firestore';

export type { SyncableStore, FirebaseSyncOptions } from './sync';
export { createFirebaseSync } from './sync';

export {
  createConfirmationDoc,
  getConfirmationDoc,
  updateConfirmationEventDetails,
  updateConfirmationPlayers,
  updatePlayerConfirmation,
  lockConfirmationDoc,
  unlockConfirmationDoc,
  deleteConfirmationDoc,
  subscribeToConfirmation,
} from './confirmation-firestore';

export type { User, UserProfile, RegisterResult } from './auth';
export {
  registerUser,
  loginUser,
  signOut,
  subscribeToAuthState,
  getAuthErrorMessage,
  getUserProfile,
  sendVerificationEmail,
  reloadUser,
  setAuthInstance,
  updateUserPassword,
  updateUserClubName,
} from './auth';
