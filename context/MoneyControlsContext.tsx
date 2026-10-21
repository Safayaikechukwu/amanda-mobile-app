import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  DEFAULT_MONEY_CONTROLS,
  loadMoneyControls,
  saveMoneyControls,
  type StoredMoneyControls,
} from '@/helpers/moneyControlsStorage';
import {
  buildSpendingWindowAppliedReply,
  tryParseSpendingWindowRequest,
} from '@/helpers/spendingWindowChat';
import { formatWindowRange } from '@/helpers/spendingWindow';

type MoneyControlsContextValue = {
  ready: boolean;
  spendingWindow: StoredMoneyControls['spendingWindow'];
  stats: StoredMoneyControls['stats'];
  limits: StoredMoneyControls['limits'];
  applySpendingWindow: (startMinutes: number, endMinutes: number) => Promise<void>;
  recordSpendingWindowChange: () => Promise<void>;
  handleSpendingWindowChat: (text: string) => string | null;
};

const MoneyControlsContext = createContext<MoneyControlsContextValue | null>(null);

export function MoneyControlsProvider({ children }: { children: ReactNode }) {
  const [controls, setControls] = useState<StoredMoneyControls>(DEFAULT_MONEY_CONTROLS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void loadMoneyControls().then((loaded) => {
      setControls(loaded);
      setReady(true);
    });
  }, []);

  const persist = useCallback(async (updater: (prev: StoredMoneyControls) => StoredMoneyControls) => {
    setControls((prev) => {
      const next = updater(prev);
      void saveMoneyControls(next);
      return next;
    });
  }, []);

  const applySpendingWindow = useCallback(
    async (startMinutes: number, endMinutes: number) => {
      await persist((prev) => ({
        ...prev,
        spendingWindow: { startMinutes, endMinutes },
      }));
    },
    [persist],
  );

  const recordSpendingWindowChange = useCallback(async () => {
    await persist((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        changesUsedThisMonth: prev.stats.changesUsedThisMonth + 1,
        changesUsedThisWeek: prev.stats.changesUsedThisWeek + 1,
      },
    }));
  }, [persist]);

  const handleSpendingWindowChat = useCallback(
    (text: string): string | null => {
      if (/^set my spending window to/i.test(text.trim())) {
        return null;
      }

      const parsed = tryParseSpendingWindowRequest(text);
      if (parsed) {
        const { start, end } = parsed;
        const current = controls.spendingWindow;
        const unchanged =
          current.startMinutes === start && current.endMinutes === end;

        void applySpendingWindow(start, end);
        void recordSpendingWindowChange();

        if (unchanged) {
          return `Your spending window is already ${formatWindowRange(start, end)}.`;
        }
        return buildSpendingWindowAppliedReply(start, end);
      }

      if (/spending\s+window|window\s+hours|when\s+can\s+i\s+spend/i.test(text)) {
        return `Your spending window is ${formatWindowRange(
          controls.spendingWindow.startMinutes,
          controls.spendingWindow.endMinutes,
        )}. Say “change my spending window to 9 AM to 7 PM” to update it.`;
      }

      return null;
    },
    [applySpendingWindow, controls.spendingWindow, recordSpendingWindowChange],
  );

  const value = useMemo<MoneyControlsContextValue>(
    () => ({
      ready,
      spendingWindow: controls.spendingWindow,
      stats: controls.stats,
      limits: controls.limits,
      applySpendingWindow,
      recordSpendingWindowChange,
      handleSpendingWindowChat,
    }),
    [
      applySpendingWindow,
      controls.limits,
      controls.spendingWindow,
      controls.stats,
      handleSpendingWindowChat,
      ready,
      recordSpendingWindowChange,
    ],
  );

  return <MoneyControlsContext.Provider value={value}>{children}</MoneyControlsContext.Provider>;
}

export function useMoneyControls(): MoneyControlsContextValue {
  const ctx = useContext(MoneyControlsContext);
  if (!ctx) throw new Error('useMoneyControls must be used within MoneyControlsProvider');
  return ctx;
}
