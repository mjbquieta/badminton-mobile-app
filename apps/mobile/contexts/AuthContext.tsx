import { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import {
  initializeFirebase,
  subscribeToAuthState,
  loginUser,
  registerUser,
  signOut,
  sendVerificationEmail as firebaseSendVerificationEmail,
  reloadUser,
  setAuthInstance,
  type User,
} from '@badminton/firebase';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from '@/config/firebase';

interface AuthContextType {
  user: User | null;
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
  const [loading, setLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    const app = initializeFirebase(firebaseConfig);

    const auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
    setAuthInstance(auth);

    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Auto-refresh verification status when app returns from background
  useEffect(() => {
    if (!user || user.emailVerified) return;

    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active') {
        await reloadUser(user);
        setRefreshCounter((c) => c + 1);
      }
    });

    return () => subscription.remove();
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
      user, loading, emailVerified,
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
