import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { promptPasskeyAuth } from '@/helpers/localAuth';
import {
  completeNotificationSetup as persistNotificationSetupComplete,
  isNotificationSetupPending,
  markSignupNeedsNotifications,
} from '@/helpers/notifications';

const SESSION_KEY = 'udara.auth.session';

export type AuthProvider = 'passkey' | 'email';

export type AuthUser = {
  id: string;
  provider: AuthProvider;
  email: string | null;
  phone: string | null;
  name: string | null;
  passkeyRegistered: boolean;
};

type AuthContextValue = {
  isReady: boolean;
  hasAccount: boolean;
  isUnlocked: boolean;
  isLoggedIn: boolean;
  needsNotificationSetup: boolean;
  user: AuthUser | null;
  draftEmail: string;
  setDraftEmail: (email: string) => void;
  isLoading: boolean;
  error: string | null;
  signInWithEmail: (email: string) => Promise<boolean>;
  registerPasskey: () => Promise<boolean>;
  signInWithPasskey: () => Promise<boolean>;
  unlockSession: () => void;
  /** Full sign out — clears account from device. */
  signOut: () => Promise<void>;
  /** Same as signOut — use when switching accounts from the passkey screen. */
  switchAccount: () => Promise<void>;
  completeNotificationSetup: () => Promise<void>;
  updateUserName: (name: string) => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USER: AuthUser = {
  id: 'udara-demo',
  provider: 'passkey',
  email: 'ikechukwu@useudara.com',
  phone: '+2348012345678',
  name: 'Ikechukwu Ndubueze',
  passkeyRegistered: true,
};

async function createAccount(email: string, opts?: { newUser?: boolean }): Promise<AuthUser> {
  await new Promise((r) => setTimeout(r, 350));
  return {
    ...DEMO_USER,
    id: `udara-${Date.now()}`,
    email,
    name: opts?.newUser ? null : DEMO_USER.name,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [draftEmail, setDraftEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsNotificationSetup, setNeedsNotificationSetup] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(SESSION_KEY), isNotificationSetupPending()])
      .then(([raw, pendingNotifications]) => {
        if (raw) setUser(JSON.parse(raw) as AuthUser);
        setNeedsNotificationSetup(pendingNotifications);
      })
      .finally(() => setIsReady(true));
  }, []);

  const persist = async (next: AuthUser | null) => {
    if (next) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(next));
    else await AsyncStorage.removeItem(SESSION_KEY);
    setUser(next);
  };

  const unlockSession = useCallback(() => {
    setIsUnlocked(true);
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const trimmed = email.trim();
      const authed = await createAccount(trimmed);
      await persist({ ...authed, passkeyRegistered: true });
      setDraftEmail(trimmed);
      setIsUnlocked(false);
      return true;
    } catch {
      setError('Could not sign in. Try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerPasskey = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const authed = await createAccount(draftEmail || DEMO_USER.email!, { newUser: true });
      await persist({ ...authed, passkeyRegistered: true });
      await promptPasskeyAuth('Enable Face ID for Udara');
      await markSignupNeedsNotifications();
      setNeedsNotificationSetup(true);
      setIsUnlocked(true);
      return true;
    } catch {
      setError('Passkey setup failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [draftEmail]);

  const signInWithPasskey = useCallback(async () => {
    if (!user) return false;
    setError(null);
    setIsLoading(true);
    try {
      const ok = await promptPasskeyAuth('Sign in to Udara');
      if (ok) {
        setIsUnlocked(true);
        return true;
      }
      if (Platform.OS === 'web') {
        setIsUnlocked(true);
        return true;
      }
      setError('Passkey cancelled. Tap Continue to try again.');
      return false;
    } catch {
      setError('Passkey failed. Tap Continue to try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const clearSession = useCallback(async () => {
    setError(null);
    setDraftEmail('');
    setIsUnlocked(false);
    await persist(null);
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const switchAccount = signOut;

  const completeNotificationSetup = useCallback(async () => {
    await persistNotificationSetupComplete();
    setNeedsNotificationSetup(false);
  }, []);

  const updateUserName = useCallback(async (name: string) => {
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    await persist({ ...user, name: trimmed });
  }, [user]);

  const clearError = useCallback(() => setError(null), []);

  const hasAccount = !!user;

  return (
    <AuthContext.Provider
      value={{
        isReady,
        hasAccount,
        isUnlocked,
        isLoggedIn: hasAccount && isUnlocked,
        needsNotificationSetup,
        user,
        draftEmail,
        setDraftEmail,
        isLoading,
        error,
        signInWithEmail,
        registerPasskey,
        signInWithPasskey,
        unlockSession,
        signOut,
        switchAccount,
        completeNotificationSetup,
        updateUserName,
        clearError,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
