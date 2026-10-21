import { AppTheme } from '@/constants/AppTheme';

/** Shared health language for Insights summary metrics. */
export type HealthTone = 'strong' | 'stable' | 'watch' | 'trouble';

export const HEALTH_COLORS: Record<HealthTone, string> = {
  strong: '#059669',
  stable: AppTheme.text,
  watch: '#d97706',
  trouble: '#dc2626',
};

export const HEALTH_WASH: Record<HealthTone, string> = {
  strong: '#ecfdf5',
  stable: AppTheme.track,
  watch: '#fffbeb',
  trouble: '#fef2f2',
};

export const HEALTH_LABEL: Record<HealthTone, string> = {
  strong: 'Strong',
  stable: 'Stable',
  watch: 'Watch',
  trouble: 'Trouble',
};

/** Soft chip fill (slightly stronger than wash). */
export const HEALTH_CHIP_BG: Record<HealthTone, string> = {
  strong: '#d1fae5',
  stable: '#e5e5e5',
  watch: '#fde68a',
  trouble: '#fecaca',
};

export function toneFromRunwayWeeks(weeks: number): HealthTone {
  if (weeks >= 12) return 'strong';
  if (weeks >= 6) return 'stable';
  if (weeks >= 3) return 'watch';
  return 'trouble';
}

export function toneFromFreeCash(freeCash: number, earned: number): HealthTone {
  if (freeCash < 0) return 'trouble';
  if (freeCash === 0) return 'watch';
  if (earned > 0 && freeCash / earned >= 0.2) return 'strong';
  return 'stable';
}

export function toneFromUdaraScore(score: number): HealthTone {
  if (score >= 80) return 'strong';
  if (score >= 65) return 'stable';
  if (score >= 45) return 'watch';
  return 'trouble';
}

/** Budget remaining vs budgeted (SpendHero). */
export function toneFromBudgetLeft(left: number, budgeted: number): HealthTone {
  if (left < 0) return 'trouble';
  if (budgeted <= 0) return 'stable';
  const remaining = left / budgeted;
  if (remaining < 0.15) return 'watch';
  return 'stable';
}

/** Bills due vs liquid cash. */
export function toneFromBillsDue(totalDue: number, liquidCash: number): HealthTone {
  if (totalDue <= 0) return 'stable';
  if (liquidCash <= 0) return 'trouble';
  const cover = liquidCash / totalDue;
  if (cover >= 4) return 'strong';
  if (cover >= 2) return 'stable';
  if (cover >= 1) return 'watch';
  return 'trouble';
}

/** Subscription burn as share of earned. */
export function toneFromSubscriptionBurn(total: number, earned: number): HealthTone {
  if (total <= 0) return 'stable';
  if (earned <= 0) return 'watch';
  const share = total / earned;
  if (share < 0.05) return 'strong';
  if (share < 0.12) return 'stable';
  if (share < 0.2) return 'watch';
  return 'trouble';
}

/** Needs-review backlog. */
export function toneFromReviewCount(count: number): HealthTone {
  if (count <= 0) return 'strong';
  if (count <= 2) return 'watch';
  return 'trouble';
}

/** Outflow / spend volume — neutral-to-watch (not inherently bad). */
export function toneFromSpend(spent: number, budgeted: number): HealthTone {
  if (budgeted <= 0) return 'stable';
  const ratio = spent / budgeted;
  if (ratio > 1) return 'trouble';
  if (ratio >= 0.85) return 'watch';
  if (ratio <= 0.6) return 'strong';
  return 'stable';
}
