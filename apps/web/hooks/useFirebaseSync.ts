'use client';

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
 * Uses the same session ID as the mobile app so both platforms
 * share the same data in real time.
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
          store.dispatch({ type: 'players/setPlayers', payload: existing.players });
          store.dispatch({ type: 'courts/setCourts', payload: existing.courts });
          store.dispatch({ type: 'queue/setQueue', payload: existing.queue });
        }

        if (!cancelled) {
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
