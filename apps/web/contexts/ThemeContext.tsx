'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeMode } from '@badminton/types';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = 'rallyup-theme';

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function resolveTheme(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'system') return getSystemTheme();
  return mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved && (saved === 'dark' || saved === 'light' || saved === 'system')) {
      setThemeState(saved);
      setResolvedTheme(resolveTheme(saved));
    }
  }, []);

  // Apply theme class to <html> and listen for system changes
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);

    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);

    // Listen for system theme changes when in system mode
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: light)');
      const handler = (e: MediaQueryListEvent) => {
        const newResolved = e.matches ? 'light' : 'dark';
        setResolvedTheme(newResolved);
        root.classList.remove('light', 'dark');
        root.classList.add(newResolved);
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  function setTheme(mode: ThemeMode) {
    setThemeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }

  function toggleTheme() {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
