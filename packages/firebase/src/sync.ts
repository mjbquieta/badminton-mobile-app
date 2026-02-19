import { type Player, type Court, type Draft } from '@badminton/types';
import {
  updateSessionFull,
  subscribeToSession,
  type SessionData,
} from './firestore';

/**
 * Minimal store interface used by the sync layer.
 * This avoids a hard dependency on @badminton/store.
 */
export interface SyncableStore {
  getState: () => {
    players: { items: Player[] };
    courts: { items: Court[] };
    drafts: { items: Draft[] };
  };
  dispatch: (action: { type: string; payload?: unknown }) => void;
  subscribe: (listener: () => void) => () => void;
}

export interface FirebaseSyncOptions {
  /** Debounce delay (ms) before writing state to Firestore. Default: 500 */
  debounceMs?: number;
}

/**
 * Creates a bidirectional sync between a Redux store and a Firestore session.
 *
 * - Store changes are debounced and written to Firestore
 * - Firestore changes are pushed into the store via setPlayers/setCourts/setDrafts
 * - Prevents infinite loops by skipping store writes triggered by Firestore updates
 *
 * Returns a cleanup function to stop syncing.
 */
export function createFirebaseSync(
  store: SyncableStore,
  sessionId: string,
  options: FirebaseSyncOptions = {}
) {
  const { debounceMs = 500 } = options;

  let isUpdatingFromFirestore = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let lastSyncedState: string | null = null;

  // --- Store → Firestore (debounced) ---
  const unsubscribeStore = store.subscribe(() => {
    if (isUpdatingFromFirestore) return;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const state = store.getState();
      const stateSnapshot = JSON.stringify({
        players: state.players.items,
        courts: state.courts.items,
        drafts: state.drafts.items,
      });

      // Skip if state hasn't actually changed
      if (stateSnapshot === lastSyncedState) return;
      lastSyncedState = stateSnapshot;

      updateSessionFull(
        sessionId,
        state.players.items,
        state.courts.items,
        state.drafts.items
      ).catch((err) => {
        console.error('[firebase-sync] Failed to write to Firestore:', err);
      });
    }, debounceMs);
  });

  // --- Firestore → Store (real-time) ---
  const unsubscribeFirestore = subscribeToSession(
    sessionId,
    (data: SessionData) => {
      const incomingSnapshot = JSON.stringify({
        players: data.players,
        courts: data.courts,
        drafts: data.drafts,
      });

      // Skip if data matches what we last synced (our own write echoing back)
      if (incomingSnapshot === lastSyncedState) return;
      lastSyncedState = incomingSnapshot;

      isUpdatingFromFirestore = true;
      try {
        store.dispatch({ type: 'players/setPlayers', payload: data.players });
        store.dispatch({ type: 'courts/setCourts', payload: data.courts });
        store.dispatch({ type: 'drafts/setDrafts', payload: data.drafts });
      } finally {
        isUpdatingFromFirestore = false;
      }
    },
    (err) => {
      console.error('[firebase-sync] Firestore listener error:', err);
    }
  );

  return function cleanup() {
    unsubscribeStore();
    unsubscribeFirestore();
    if (debounceTimer) clearTimeout(debounceTimer);
  };
}
