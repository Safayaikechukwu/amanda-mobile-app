import { AppTheme } from '@/constants/AppTheme';
import { formatNaira, type InsightTransaction } from '@/constants/MockInsights';

/** Shared money-movement states across Insights + Savings. */
export type MoneyMovementStatus =
  | 'incoming'
  | 'outgoing_transfer'
  | 'successful'
  | 'pending'
  | 'failed';

export type MoneyMovementDirection = 'in' | 'out';

export const STATUS_META: Record<
  MoneyMovementStatus,
  {
    label: string;
    amountColor: string;
    avatarBg: string;
    avatarText: string;
    dotColor: string;
  }
> = {
  incoming: {
    label: 'Incoming',
    amountColor: AppTheme.positive,
    avatarBg: 'rgba(5,150,105,0.12)',
    avatarText: '#047857',
    dotColor: AppTheme.positive,
  },
  outgoing_transfer: {
    label: 'Outgoing transfer',
    amountColor: AppTheme.accent,
    avatarBg: 'rgba(74,5,8,0.1)',
    avatarText: AppTheme.accent,
    dotColor: AppTheme.accent,
  },
  successful: {
    label: 'Successful',
    amountColor: AppTheme.text,
    avatarBg: AppTheme.track,
    avatarText: AppTheme.text,
    dotColor: '#9ca3af',
  },
  pending: {
    label: 'Pending',
    amountColor: '#D97706',
    avatarBg: 'rgba(217,119,6,0.12)',
    avatarText: '#B45309',
    dotColor: '#D97706',
  },
  failed: {
    label: 'Failed',
    amountColor: '#DC2626',
    avatarBg: 'rgba(220,38,38,0.1)',
    avatarText: '#DC2626',
    dotColor: '#DC2626',
  },
};

export function resolveTransactionStatus(txn: InsightTransaction): MoneyMovementStatus {
  if (txn.status) return txn.status;
  if (txn.upcoming) return 'pending';
  if (txn.amount < 0) return 'incoming';
  if (/transfer/i.test(txn.merchant)) return 'outgoing_transfer';
  return 'successful';
}

export function resolveSavingsStatus(input: {
  status?: MoneyMovementStatus;
  direction?: MoneyMovementDirection;
  label?: string;
}): MoneyMovementStatus {
  if (input.status) return input.status;
  if (input.direction === 'out') {
    return /transfer/i.test(input.label ?? '') ? 'outgoing_transfer' : 'successful';
  }
  return 'incoming';
}

export function formatMovementAmount(
  amount: number,
  status: MoneyMovementStatus,
  direction?: MoneyMovementDirection,
  formatCurrency: (value: number) => string = formatNaira,
): { text: string; color: string; struck?: boolean } {
  const abs = Math.abs(Math.round(amount));
  const formatted = formatCurrency(abs);
  const meta = STATUS_META[status];
  const isIn = status === 'incoming' || direction === 'in';

  if (isIn) {
    return { text: `+${formatted}`, color: meta.amountColor };
  }

  return {
    text: formatted,
    color: meta.amountColor,
    struck: status === 'failed',
  };
}

export function movementSubtitle(parts: string[], status: MoneyMovementStatus): string {
  const label = STATUS_META[status].label;
  const base = parts.filter(Boolean).join(' · ');
  if (status === 'successful' || status === 'incoming') return base;
  return base ? `${base} · ${label}` : label;
}
