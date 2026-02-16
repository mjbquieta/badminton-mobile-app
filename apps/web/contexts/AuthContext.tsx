'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  initializeFirebase,
  subscribeToAuthState,
  loginUser,
  registerUser,
  signOut,
  getUserProfile,
  sendVerificationEmail as firebaseSendVerificationEmail,
  reloadUser,
  type User,
  type UserProfile,
} from '@badminton/firebase';
import { firebaseConfig } from '@/config/firebase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  emailVerified: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, clubName: string) => Promise<{ verificationEmailSent: boolean }>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    initializeFirebase(firebaseConfig);

    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userProfile = await getUserProfile(firebaseUser.uid);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Auto-refresh verification status when user returns to tab
  useEffect(() => {
    if (!user || user.emailVerified) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        await reloadUser(user);
        setRefreshCounter((c) => c + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, user?.emailVerified]);

  const emailVerified = user?.emailVerified ?? false;

  const login = async (email: string, password: string) => {
    await loginUser(email, password);
  };

  const register = async (email: string, password: string, clubName: string) => {
    const result = await registerUser(email, password, clubName);
    return { verificationEmailSent: result.verificationEmailSent };
  };

  const logout = async () => {
    await signOut();
  };

  const sendVerificationEmail = async () => {
    if (!user) throw new Error('No user logged in');
    await firebaseSendVerificationEmail(user);
  };

  const refreshUser = async () => {
    if (!user) return;
    await reloadUser(user);
    setRefreshCounter((c) => c + 1);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, emailVerified,
      login, register, logout, sendVerificationEmail, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
