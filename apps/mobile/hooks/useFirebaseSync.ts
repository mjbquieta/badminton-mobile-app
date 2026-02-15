import { useEffect, useRef, useState } from 'react';
import {
  createSession,
  getSession,
  createFirebaseSync,
  type SyncableStore,
} from '@badminton/firebase';

/**
 * Hook that syncs Redux state with Firestore for a given session.
 *
 * Firebase must already be initialized (by AuthProvider) before this hook runs.
 * The sessionId is the authenticated user's UID, so each user gets their own session.
 */
export function useFirebaseSync(store: SyncableStore, sessionId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const existing = await getSession(sessionId);

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
          cleanupRef.current = createFirebaseSync(store, sessionId);
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
  }, [store, sessionId]);

  return { sessionId, isLoading };
}
