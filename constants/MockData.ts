/** Mock data for Odara v1 Home dashboard */
export const MockHome = {
  userName: 'EK',
  greeting: () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  },
  sapphire: {
    label: 'Good Money Sapphire',
    score: 78,
    status: 'Stable',
    subtitle: 'Your financial position is holding steady this week.',
  },
  bento: {
    runway: { label: 'Runway', value: '6.2 weeks', hint: 'At current spend' },
    upcoming: { label: 'Upcoming payments', value: '3', hint: '₦84,500 due' },
    neededToday: { label: 'Needed today', value: '₦12,400', hint: 'Odara estimate' },
    score: { label: 'Udara Score', value: '78', hint: 'Financial health' },
    savedToday: { label: 'Saved today', value: '₦5,000', hint: 'Locked in' },
  },
  composerSuggestions: ['Add money', 'Pay bill'] as const,
};

export const MockHistory = [
  { id: '1', title: 'Runway check this week', unread: false },
  { id: '2', title: 'Upcoming bills & payments', unread: true },
  { id: '3', title: 'Rent savings goal', unread: false },
] as const;

/** @deprecated use MockHistory */
export const MockDrawerRecents = MockHistory;

import type { MoneyMovementDirection, MoneyMovementStatus } from '@/constants/TransactionStatus';

export type SavingsBucketId = 'spend-save' | 'auto-save' | 'hardlock' | 'goal-based';

export type SavingsActivity = {
  id: string;
  label: string;
  amount: number;
  meta: string;
  occurredAt?: string;
  status?: MoneyMovementStatus;
  direction?: MoneyMovementDirection;
};

export type SavingsBucket = {
  id: SavingsBucketId;
  title: string;
  subtitle: string;
  amount: number;
  color: string;
  icon: 'swap-horizontal-outline' | 'flash-outline' | 'lock-closed-outline' | 'flag-outline';
  items: SavingsActivity[];
};

export const MockSavingsBuckets: SavingsBucket[] = [
  {
    id: 'spend-save',
    title: 'Spend & Save',
    subtitle: 'Save a cut of every spend',
    amount: 128500,
    color: '#7A2E35',
    icon: 'swap-horizontal-outline',
    items: [
      { id: 'ss1', label: 'Round-ups', amount: 18500, meta: 'This month', occurredAt: '2026-08-23T11:20:00', status: 'successful', direction: 'in' },
      { id: 'ss2', label: 'Spend match 5%', amount: 110000, meta: 'Active', occurredAt: '2026-08-10T08:00:00', status: 'successful', direction: 'in' },
      { id: 'ss3', label: 'Transfer out · Main', amount: 5000, meta: 'Yesterday', occurredAt: '2026-08-26T16:45:00', status: 'outgoing_transfer', direction: 'out' },
    ],
  },
  {
    id: 'auto-save',
    title: 'Auto Save',
    subtitle: 'Scheduled transfers on autopilot',
    amount: 240000,
    color: '#2A7D62',
    icon: 'flash-outline',
    items: [
      { id: 'as1', label: 'Weekly ₦10k', amount: 160000, meta: 'Every Friday', occurredAt: '2026-08-15T09:00:00', status: 'successful', direction: 'in' },
      { id: 'as2', label: 'Payday 10%', amount: 80000, meta: 'Monthly', occurredAt: '2026-08-01T12:30:00', status: 'successful', direction: 'in' },
      { id: 'as3', label: 'Scheduled top-up', amount: 10000, meta: 'Processing', occurredAt: '2026-08-27T07:15:00', status: 'pending', direction: 'in' },
    ],
  },
  {
    id: 'hardlock',
    title: 'HardLock',
    subtitle: 'Locked funds you can’t touch early',
    amount: 500000,
    color: '#4568A6',
    icon: 'lock-closed-outline',
    items: [
      { id: 'sl1', label: 'Q4 lock', amount: 300000, meta: 'Unlocks Dec 2026', occurredAt: '2026-07-05T10:00:00', status: 'successful', direction: 'in' },
      { id: 'sl2', label: '90-day lock', amount: 200000, meta: 'Unlocks Nov 2026', occurredAt: '2026-06-18T14:20:00', status: 'successful', direction: 'in' },
      { id: 'sl3', label: 'Early unlock request', amount: 50000, meta: 'Declined', occurredAt: '2026-08-18T11:05:00', status: 'failed', direction: 'out' },
    ],
  },
  {
    id: 'goal-based',
    title: 'Money pots',
    subtitle: 'Separate pots for what you’re saving for',
    amount: 465000,
    color: '#9A6B35',
    icon: 'flag-outline',
    items: [
      { id: 'gb1', label: 'Emergency fund', amount: 145000, meta: 'of ₦500,000' },
      { id: 'gb2', label: 'Rent buffer', amount: 320000, meta: 'of ₦450,000' },
      { id: 'gb3', label: 'Trip home', amount: 0, meta: 'of ₦1,200,000' },
    ],
  },
];

export type RecentSave = {
  id: string;
  label: string;
  amount: number;
  when: string;
  occurredAt?: string;
  status?: MoneyMovementStatus;
  direction?: MoneyMovementDirection;
  bucketId?: SavingsBucketId;
};

export const MockRecentSaves: RecentSave[] = [
  { id: 'r1', label: 'Auto Save · Weekly', amount: 10000, when: 'Today', occurredAt: '2026-08-27T09:15:00', status: 'successful', direction: 'in', bucketId: 'auto-save' },
  { id: 'r2', label: 'Spend & Save · Round-up', amount: 350, when: 'Yesterday', occurredAt: '2026-08-26T14:30:00', status: 'successful', direction: 'in', bucketId: 'spend-save' },
  { id: 'r3', label: 'HardLock · Top-up', amount: 50000, when: 'Mon', occurredAt: '2026-08-24T10:00:00', status: 'successful', direction: 'in', bucketId: 'hardlock' },
  { id: 'r4', label: 'Withdrawal · Rent buffer', amount: 15000, when: 'Sun', occurredAt: '2026-08-23T18:20:00', status: 'pending', direction: 'out', bucketId: 'goal-based' },
  { id: 'r5', label: 'Transfer · Main account', amount: 8000, when: 'Sat', occurredAt: '2026-08-22T11:40:00', status: 'failed', direction: 'out', bucketId: 'spend-save' },
  { id: 'r6', label: 'Auto Save · Payday', amount: 25000, when: 'Fri', occurredAt: '2026-08-21T08:05:00', status: 'successful', direction: 'in', bucketId: 'auto-save' },
  { id: 'r7', label: 'Quick Save → Emergency fund', amount: 5000, when: 'Thu', occurredAt: '2026-08-20T19:10:00', status: 'successful', direction: 'in', bucketId: 'goal-based' },
  { id: 'r8', label: 'Spend & Save · Round-up', amount: 420, when: 'Wed', occurredAt: '2026-08-19T13:25:00', status: 'successful', direction: 'in', bucketId: 'spend-save' },
  { id: 'r9', label: 'HardLock · Top-up', amount: 100000, when: 'Tue', occurredAt: '2026-08-18T16:50:00', status: 'successful', direction: 'in', bucketId: 'hardlock' },
];

/** @deprecated */
export type SavingsGoal = {
  id: string;
  name: string;
  current: number;
  target: number;
};

/** @deprecated */
export const MockSavingsGoals: SavingsGoal[] = MockSavingsBuckets[3].items.map((i) => ({
  id: i.id,
  name: i.label,
  current: i.amount,
  target: 500000,
}));

/** @deprecated */
export const MockSavings = MockSavingsGoals.map((g) => ({
  id: g.id,
  name: g.name,
  amount: `₦${g.current.toLocaleString('en-NG')}`,
  progress: g.target > 0 ? g.current / g.target : 0,
}));

export const MockBills = [
  { id: '1', name: 'Electricity', provider: 'IKEDC', due: 'Mar 2' },
  { id: '2', name: 'Airtime', provider: 'MTN', due: 'Anytime' },
  { id: '3', name: 'Data', provider: 'Airtel', due: 'Anytime' },
  { id: '4', name: 'TV', provider: 'DStv', due: 'Mar 8' },
];
