import { formatNaira } from '@/constants/MockInsights';
import type { UserPreferences } from '@/helpers/userPreferences';

/** Demo conversion for USD display — underlying balances stay in NGN. */
const NGN_PER_USD = 1500;

type BalancePrefs = Pick<UserPreferences, 'hideBalance' | 'showBalanceInNaira'>;

export function formatDollar(ngnAmount: number): string {
  const usd = Math.abs(ngnAmount) / NGN_PER_USD;
  const formatted = usd.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return ngnAmount < 0 ? `-$${formatted}` : `$${formatted}`;
}

export function formatDisplayAmount(amount: number, prefs: BalancePrefs): string {
  if (prefs.hideBalance) return '••••••';
  return formatCurrencyLabel(amount, prefs);
}

/** Currency label for copy/increments — ignores hide-balance. */
export function formatCurrencyLabel(amount: number, prefs: Pick<UserPreferences, 'showBalanceInNaira'>): string {
  if (prefs.showBalanceInNaira) return formatNaira(amount);
  return formatDollar(amount);
}
