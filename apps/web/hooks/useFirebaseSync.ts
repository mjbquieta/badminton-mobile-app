'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createSession,
  getSession,
  createFirebaseSync,
  enableOfflinePersistence,
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
  const offlineInitRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Enable offline persistence once
        if (!offlineInitRef.current) {
          offlineInitRef.current = true;
          await enableOfflinePersistence({ multiTab: true }).catch(() => {
            // Silently handle - persistence may already be enabled or not supported
          });
        }

        const defaultMeta = { enabled: false, serialId: '', pin: '', locked: false };

        // Reset store to prevent stale data from a previous session
        store.dispatch({ type: 'players/setPlayers', payload: [] });
        store.dispatch({ type: 'courts/setCourts', payload: [] });
        store.dispatch({ type: 'drafts/setDrafts', payload: [] });
        store.dispatch({ type: 'confirmation/setConfirmationMeta', payload: defaultMeta });

        const existing = await getSession(sessionId);

        if (!existing) {
          await createSession(sessionId, [], []);
        } else {
          store.dispatch({ type: 'players/setPlayers', payload: existing.players });
          store.dispatch({ type: 'courts/setCourts', payload: existing.courts });
          store.dispatch({ type: 'drafts/setDrafts', payload: existing.drafts });
          store.dispatch({ type: 'confirmation/setConfirmationMeta', payload: existing.confirmation ?? defaultMeta });
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

/**
 * Hook that tracks online/offline status.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    function handleOnline() { setIsOnline(true); }
    function handleOffline() { setIsOnline(false); }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
