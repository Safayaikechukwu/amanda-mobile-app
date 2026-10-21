import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  MockSpendingLimits,
  MockSpendingWindow,
  MockSpendingWindowStats,
} from '@/constants/MoneyControls';

const KEY = 'udara.moneyControls';

export type StoredMoneyControls = {
  spendingWindow: {
    startMinutes: number;
    endMinutes: number;
  };
  stats: {
    brokenThisMonth: number;
    changesUsedThisMonth: number;
    changesUsedThisWeek: number;
  };
  limits: {
    daily: number;
    weekly: number;
    monthly: number;
  };
};

export const DEFAULT_MONEY_CONTROLS: StoredMoneyControls = {
  spendingWindow: {
    startMinutes: MockSpendingWindow.startMinutes,
    endMinutes: MockSpendingWindow.endMinutes,
  },
  stats: { ...MockSpendingWindowStats },
  limits: { ...MockSpendingLimits },
};

export async function loadMoneyControls(): Promise<StoredMoneyControls> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return { ...DEFAULT_MONEY_CONTROLS, stats: { ...DEFAULT_MONEY_CONTROLS.stats }, limits: { ...DEFAULT_MONEY_CONTROLS.limits } };

  try {
    const parsed = JSON.parse(raw) as Partial<StoredMoneyControls>;
    return {
      spendingWindow: {
        startMinutes:
          parsed.spendingWindow?.startMinutes ?? DEFAULT_MONEY_CONTROLS.spendingWindow.startMinutes,
        endMinutes:
          parsed.spendingWindow?.endMinutes ?? DEFAULT_MONEY_CONTROLS.spendingWindow.endMinutes,
      },
      stats: { ...DEFAULT_MONEY_CONTROLS.stats, ...parsed.stats },
      limits: { ...DEFAULT_MONEY_CONTROLS.limits, ...parsed.limits },
    };
  } catch {
    return {
      ...DEFAULT_MONEY_CONTROLS,
      stats: { ...DEFAULT_MONEY_CONTROLS.stats },
      limits: { ...DEFAULT_MONEY_CONTROLS.limits },
    };
  }
}

export async function saveMoneyControls(data: StoredMoneyControls): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}
