import type { SavingsBucketId } from '@/constants/MockData';

/** Soft, warm surfaces — approachable without losing bucket identity. */
export const SavingsBucketTheme: Record<
  SavingsBucketId,
  { accent: string; surface: string; iconBg: string }
> = {
  'spend-save': {
    accent: '#7A2E35',
    surface: '#FDF7F7',
    iconBg: '#F3E6E7',
  },
  'auto-save': {
    accent: '#2A7D62',
    surface: '#F5FAF7',
    iconBg: '#E2F0EA',
  },
  hardlock: {
    accent: '#4568A6',
    surface: '#F6F8FC',
    iconBg: '#E6ECF6',
  },
  'goal-based': {
    accent: '#9A6B35',
    surface: '#FBF8F3',
    iconBg: '#F0E8DC',
  },
};

export function savingsAccent(id: SavingsBucketId): string {
  return SavingsBucketTheme[id].accent;
}
