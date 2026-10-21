import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { formatDisplayAmount } from '@/helpers/formatMoney';
import {
  DEFAULT_USER_PREFERENCES,
  loadUserPreferences,
  saveUserPreferences,
  type UserPreferences,
} from '@/helpers/userPreferences';

type PreferencesContextValue = {
  ready: boolean;
  preferences: UserPreferences;
  setShowBalanceInNaira: (enabled: boolean) => Promise<void>;
  setShowBalanceInDollars: (enabled: boolean) => Promise<void>;
  setHideBalance: (enabled: boolean) => Promise<void>;
  setPushNotifications: (enabled: boolean) => Promise<void>;
  setEmailNotifications: (enabled: boolean) => Promise<void>;
  formatAmount: (amount: number) => string;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void loadUserPreferences().then((loaded) => {
      setPreferences(loaded);
      setReady(true);
    });
  }, []);

  const persist = useCallback(async (updater: (prev: UserPreferences) => UserPreferences) => {
    setPreferences((prev) => {
      const next = updater(prev);
      void saveUserPreferences(next);
      return next;
    });
  }, []);

  const setShowBalanceInNaira = useCallback(
    async (enabled: boolean) => {
      await persist((prev) => ({
        ...prev,
        showBalanceInNaira: enabled ? true : false,
      }));
    },
    [persist],
  );

  const setShowBalanceInDollars = useCallback(
    async (enabled: boolean) => {
      await persist((prev) => ({
        ...prev,
        showBalanceInNaira: enabled ? false : true,
      }));
    },
    [persist],
  );

  const setHideBalance = useCallback(
    async (enabled: boolean) => {
      await persist((prev) => ({
        ...prev,
        hideBalance: enabled,
      }));
    },
    [persist],
  );

  const setPushNotifications = useCallback(
    async (enabled: boolean) => {
      await persist((prev) => ({ ...prev, pushNotifications: enabled }));
    },
    [persist],
  );

  const setEmailNotifications = useCallback(
    async (enabled: boolean) => {
      await persist((prev) => ({ ...prev, emailNotifications: enabled }));
    },
    [persist],
  );

  const formatAmount = useCallback(
    (amount: number) => formatDisplayAmount(amount, preferences),
    [preferences],
  );

  const value = useMemo(
    () => ({
      ready,
      preferences,
      setShowBalanceInNaira,
      setShowBalanceInDollars,
      setHideBalance,
      setPushNotifications,
      setEmailNotifications,
      formatAmount,
    }),
    [
      ready,
      preferences,
      setShowBalanceInNaira,
      setShowBalanceInDollars,
      setHideBalance,
      setPushNotifications,
      setEmailNotifications,
      formatAmount,
    ],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
