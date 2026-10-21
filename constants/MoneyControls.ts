/** Mock people, accounts, and spending controls for profile settings. */

import { getBeneficiaryStats } from '@/helpers/beneficiariesCatalog';
import { SPENDING_WINDOW_CHANGE_LIMITS } from '@/helpers/spendingWindow';

export const MockSpendingLimits = {
  daily: 50_000,
  weekly: 250_000,
  monthly: 1_000_000,
} as const;

export const MockSpendingWindow = {
  startMinutes: 7 * 60,
  endMinutes: 20 * 60,
  startLabel: '7:00 AM',
  endLabel: '8:00 PM',
  summary: '7:00 AM – 8:00 PM',
} as const;

export const MockSpendingWindowStats = {
  brokenThisMonth: 2,
  changesUsedThisMonth: 1,
  changesUsedThisWeek: 0,
} as const;

export { SPENDING_WINDOW_CHANGE_LIMITS };

export type LinkedAccount = {
  id: string;
  label: string;
  bank: string;
  last4: string;
};

export type ManagedPerson = {
  id: string;
  name: string;
  bank: string;
  last4: string;
  blocked?: boolean;
  /** ISO date when spending from this person was blocked. */
  blockedAt?: string;
  /** Max naira per transfer to this person. */
  limit?: number;
  recurringAmount?: number;
  recurringCadence?: 'monthly' | 'weekly';
  /** Next debit label for UI, e.g. "1 Sep". */
  recurringNext?: string;
  sendCount?: number;
  totalSent?: number;
};

export const MockLinkedAccounts: LinkedAccount[] = [
  { id: 'primary', label: 'Primary account', bank: 'GTBank', last4: '4821' },
  { id: 'savings', label: 'Savings pocket', bank: 'Udara', last4: '0093' },
];

export const MockManagedPeople: ManagedPerson[] = [
  {
    id: '1',
    name: 'Amaka O.',
    bank: 'Access Bank',
    last4: '2208',
    sendCount: 12,
    totalSent: 840_000,
  },
  {
    id: '2',
    name: 'Tunde K.',
    bank: 'Zenith',
    last4: '7714',
    limit: 75_000,
    sendCount: 8,
    totalSent: 520_000,
  },
  {
    id: '3',
    name: 'Chioma N.',
    bank: 'UBA',
    last4: '9033',
    recurringAmount: 25_000,
    recurringCadence: 'monthly',
    recurringNext: '1 Sep',
    sendCount: 6,
    totalSent: 150_000,
  },
  {
    id: '4',
    name: 'Landlord',
    bank: 'First Bank',
    last4: '1180',
    recurringAmount: 450_000,
    recurringCadence: 'monthly',
    recurringNext: '1 Sep',
    sendCount: 12,
    totalSent: 5_400_000,
  },
  {
    id: '5',
    name: 'Mama',
    bank: 'Opay',
    last4: '5562',
    limit: 20_000,
    sendCount: 15,
    totalSent: 180_000,
  },
  {
    id: '6',
    name: 'Unknown sender',
    bank: 'Kuda',
    last4: '4419',
    blocked: true,
    blockedAt: '2026-07-14',
  },
];

export function getBlockedPeople(): ManagedPerson[] {
  return MockManagedPeople.filter((person) => person.blocked);
}

export function getLimitedPeople(): ManagedPerson[] {
  return MockManagedPeople.filter((person) => !person.blocked && person.limit != null);
}

export function getRecurringPeople(): ManagedPerson[] {
  return MockManagedPeople.filter((person) => !person.blocked && person.recurringAmount != null);
}

export function getRankedPayees(): ManagedPerson[] {
  return MockManagedPeople.filter(
    (person) => !person.blocked && (person.sendCount ?? 0) > 0,
  ).sort((a, b) => (b.totalSent ?? 0) - (a.totalSent ?? 0));
}

export function formatPersonAccount(person: ManagedPerson): string {
  return `${person.bank} · ·${person.last4}`;
}

export function formatBlockedDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function countBeneficiaries(): number {
  return getBeneficiaryStats().total;
}

export function countBlockedPeople(): number {
  return getBeneficiaryStats().blocked;
}

export function countLimitedPeople(): number {
  return getBeneficiaryStats().limits;
}

export function countRecurringPeople(): number {
  return getBeneficiaryStats().recurring;
}

export function peopleControlsSummary(): string {
  const stats = getBeneficiaryStats();
  return `${stats.total} people`;
}

export function restrictionsSummary(formatAmount: (amount: number) => string): string {
  return formatAmount(MockSpendingLimits.daily);
}
