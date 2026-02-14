import { useEffect, useRef, useState } from 'react';
import {
  initializeFirebase,
  createSession,
  getSession,
  createFirebaseSync,
  type SyncableStore,
} from '@badminton/firebase';
import { firebaseConfig } from '@/config/firebase';

const FIREBASE_ENABLED = !firebaseConfig.apiKey.startsWith('YOUR_');

/**
 * Hook that initializes Firebase and syncs Redux state with Firestore.
 *
 * - On first launch, creates a new Firestore session from current Redux state
 * - On subsequent launches, loads the session from Firestore
 * - Sets up real-time bidirectional sync
 *
 * Set your Firebase config in config/firebase.ts to enable.
 */
export function useFirebaseSync(store: SyncableStore) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(FIREBASE_ENABLED);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!FIREBASE_ENABLED) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function init() {
      try {
        initializeFirebase(firebaseConfig);

        // For now, use a fixed session ID stored in the app
        // In the future this could be a session picker / join flow
        const fixedSessionId = 'default-session';

        const existing = await getSession(fixedSessionId);

        if (!existing) {
          const state = store.getState();
          await createSession(
            state.players.items,
            state.courts.items,
            state.queue.ids
          );
        } else {
          // Load Firestore data into Redux
          store.dispatch({ type: 'players/setPlayers', payload: existing.players });
          store.dispatch({ type: 'courts/setCourts', payload: existing.courts });
          store.dispatch({ type: 'queue/setQueue', payload: existing.queue });
        }

        if (!cancelled) {
          // Start real-time sync
          cleanupRef.current = createFirebaseSync(store, fixedSessionId);
          setSessionId(fixedSessionId);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[useFirebaseSync] Initialization error:', error);
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
    };
  }, [store]);

  return { sessionId, isLoading, isEnabled: FIREBASE_ENABLED };
}
