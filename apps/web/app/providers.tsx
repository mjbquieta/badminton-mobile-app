'use client';

import { configureAppStore } from '@badminton/store';
import { useFirebaseSync } from '@/hooks/useFirebaseSync';
import { useAuth } from '@/contexts/AuthContext';
import { Provider } from 'react-redux';

const store = configureAppStore();

function FirebaseSyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isLoading } = useFirebaseSync(store, user!.uid);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-light-300 text-sm">Connecting to Firebase...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <FirebaseSyncProvider>{children}</FirebaseSyncProvider>
    </Provider>
  );
}
