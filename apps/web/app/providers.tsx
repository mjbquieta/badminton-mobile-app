'use client';

import { configureAppStore } from '@badminton/store';
import { useFirebaseSync } from '@/hooks/useFirebaseSync';
import { Provider } from 'react-redux';
import { useRef } from 'react';

const store = configureAppStore();

function FirebaseSyncProvider({ children }: { children: React.ReactNode }) {
  useFirebaseSync(store);
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <FirebaseSyncProvider>{children}</FirebaseSyncProvider>
    </Provider>
  );
}
