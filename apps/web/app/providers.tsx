'use client';

import { configureAppStore } from '@badminton/store';
import { Provider } from 'react-redux';
import { useRef } from 'react';

/**
 * Redux Provider wrapper for Next.js App Router
 * Creates a stable store instance using useRef to prevent recreation on re-renders
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef(configureAppStore());

  return <Provider store={storeRef.current}>{children}</Provider>;
}
