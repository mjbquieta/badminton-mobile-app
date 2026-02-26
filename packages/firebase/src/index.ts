export type { FirebaseConfig } from './config';
export { initializeFirebase, getFirebaseApp, enableOfflinePersistence } from './config';

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
  updateUserRole,
} from './auth';

export { toTimestampMs } from './timestamp-helpers';

export {
  saveMatchRecord,
  saveMatchRecordsBatch,
  getMatchHistory,
  getMatchHistoryBySession,
  subscribeToMatchHistory,
  deleteMatchRecord,
  clearMatchHistory as clearMatchHistoryFirestore,
} from './match-history-firestore';

export {
  saveTournament,
  getTournaments,
  getTournament,
  updateTournament as updateTournamentFirestore,
  deleteTournament,
  subscribeToTournaments,
} from './tournament-firestore';

export {
  saveSchedule,
  getSchedules,
  updateSchedule as updateScheduleFirestore,
  deleteSchedule,
  subscribeToSchedules,
} from './schedule-firestore';

export {
  saveDraftTemplate,
  getDraftTemplates,
  deleteDraftTemplate,
  subscribeToDraftTemplates,
} from './draft-template-firestore';
