/** Insights — fed by transactions, budgets, and upcoming bills (mock). */

import type { MoneyMovementStatus } from '@/constants/TransactionStatus';
import { SUPPORT_EMAIL } from '@/helpers/support';

export type InsightPeriod = 'day' | 'week' | 'month' | 'custom';

export type CustomDateRange = {
  start: string; // ISO date YYYY-MM-DD
  end: string;
};

export type InsightTab = 'overview' | 'transactions' | 'bills' | 'subscriptions';

export type InsightTransaction = {
  id: string;
  merchant: string;
  category: string;
  amount: number; // NGN, positive = outflow
  date: string; // ISO date
  needsReview?: boolean;
  upcoming?: boolean;
  status?: MoneyMovementStatus;
};

export type TransactionReceipt = {
  transactionId: string;
  amount: number;
  dateLabel: string;
  sender: string;
  recipient: string;
  recipientBank?: string;
  recipientAccount?: string;
  reference: string;
  sessionId: string;
};

export type InsightBudget = {
  id: string;
  name: string;
  icon: 'restaurant' | 'cart' | 'flash' | 'car' | 'home' | 'heart';
  spent: number;
  limit: number;
};

function formatNaira(n: number): string {
  const abs = Math.abs(Math.round(n));
  return `₦${abs.toLocaleString('en-NG')}`;
}

export { formatNaira };

const ALL_TXNS: InsightTransaction[] = [
  {
    id: 't1',
    merchant: 'Chicken Republic',
    category: 'Food',
    amount: 18500,
    date: '2026-08-26',
    needsReview: true,
  },
  {
    id: 't2',
    merchant: 'Transfer to Mum',
    category: 'Family',
    amount: 50000,
    date: '2026-08-25',
    status: 'outgoing_transfer',
  },
  {
    id: 't3',
    merchant: 'Uber',
    category: 'Transport',
    amount: 4200,
    date: '2026-08-25',
    needsReview: true,
  },
  {
    id: 't4',
    merchant: 'MTN Airtime',
    category: 'Utilities',
    amount: 5000,
    date: '2026-08-24',
  },
  {
    id: 't5',
    merchant: 'Shoprite',
    category: 'Groceries',
    amount: 64200,
    date: '2026-08-23',
  },
  {
    id: 't6',
    merchant: 'Netflix',
    category: 'Subscriptions',
    amount: 5500,
    date: '2026-08-22',
  },
  {
    id: 't7',
    merchant: 'Jumia',
    category: 'Shopping',
    amount: 28900,
    date: '2026-08-20',
    needsReview: true,
  },
  {
    id: 't8',
    merchant: 'Salary — Acme NG',
    category: 'Income',
    amount: -850000,
    date: '2026-08-01',
    status: 'incoming',
  },
  {
    id: 't9',
    merchant: 'DStv',
    category: 'Utilities',
    amount: 24000,
    date: '2026-08-18',
  },
  {
    id: 't10',
    merchant: 'Bolt',
    category: 'Transport',
    amount: 3100,
    date: '2026-08-17',
  },
  {
    id: 't11',
    merchant: 'Spotify',
    category: 'Subscriptions',
    amount: 1900,
    date: '2026-08-15',
  },
  {
    id: 't12',
    merchant: 'Pharmacy Plus',
    category: 'Health',
    amount: 8700,
    date: '2026-08-12',
    needsReview: true,
  },
  {
    id: 't13',
    merchant: 'Chicken Republic',
    category: 'Food',
    amount: 9200,
    date: '2026-08-10',
  },
  {
    id: 't14',
    merchant: 'Uber',
    category: 'Transport',
    amount: 2800,
    date: '2026-08-08',
  },
  {
    id: 't15',
    merchant: 'Slot NG',
    category: 'Shopping',
    amount: 45000,
    date: '2026-08-05',
  },
  {
    id: 't16',
    merchant: 'Freelance payout',
    category: 'Income',
    amount: -120000,
    date: '2026-08-14',
    status: 'incoming',
  },
  {
    id: 't17',
    merchant: 'Transfer to Tunde',
    category: 'Family',
    amount: 25000,
    date: '2026-08-26',
    status: 'pending',
    upcoming: true,
  },
  {
    id: 't18',
    merchant: 'Transfer to Landlord',
    category: 'Family',
    amount: 150000,
    date: '2026-08-24',
    status: 'failed',
  },
];

export const MockInsightBudgets: InsightBudget[] = [
  { id: 'b1', name: 'Food', icon: 'restaurant', spent: 142000, limit: 150000 },
  { id: 'b2', name: 'Transport', icon: 'car', spent: 48000, limit: 60000 },
  { id: 'b3', name: 'Shopping', icon: 'cart', spent: 89000, limit: 80000 },
  { id: 'b4', name: 'Utilities', icon: 'flash', spent: 41000, limit: 70000 },
  { id: 'b5', name: 'Home', icon: 'home', spent: 220000, limit: 350000 },
  { id: 'b6', name: 'Health', icon: 'heart', spent: 12000, limit: 40000 },
];

export type UpcomingBill = {
  id: string;
  name: string;
  provider?: string;
  /** Display label e.g. Sep 2 */
  due: string;
  /** ISO date for sorting; null = flexible / anytime */
  dueSort: string | null;
  amount: number;
  cadence: 'monthly' | 'weekly' | 'anytime';
};

export const MockUpcomingFromBills: UpcomingBill[] = [
  {
    id: 'u1',
    name: 'Electricity',
    provider: 'IKEDC',
    due: 'Sep 2',
    dueSort: '2026-09-02',
    amount: 28500,
    cadence: 'monthly',
  },
  {
    id: 'u2',
    name: 'DStv',
    provider: 'MultiChoice',
    due: 'Sep 8',
    dueSort: '2026-09-08',
    amount: 24000,
    cadence: 'monthly',
  },
  {
    id: 'u3',
    name: 'Rent contribution',
    provider: 'Home',
    due: 'Sep 1',
    dueSort: '2026-09-01',
    amount: 150000,
    cadence: 'monthly',
  },
  {
    id: 'u4',
    name: 'Airtime',
    provider: 'MTN',
    due: 'Anytime',
    dueSort: null,
    amount: 5000,
    cadence: 'anytime',
  },
  {
    id: 'u5',
    name: 'Data',
    provider: 'Airtel',
    due: 'Anytime',
    dueSort: null,
    amount: 8000,
    cadence: 'anytime',
  },
];

export type Cadence = 'monthly' | 'yearly' | 'weekly';

export type MockSubscription = {
  id: string;
  name: string;
  company: string;
  amount: number;
  cadence: Cadence;
  /** ISO YYYY-MM-DD — when the subscription started / first charge. */
  startDate: string;
  nextRenewal: string; // display
  nextRenewalSort: string; // ISO
  /** false = paused / cancelled; defaults to active when omitted. */
  active?: boolean;
};

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTH_SHORT[m - 1]} ${d}`;
}

function receiptTimeLabel(iso: string, seed: number): string {
  const hour = 8 + (seed % 12);
  const minute = (seed * 7) % 60;
  const ampm = hour >= 12 ? 'pm' : 'am';
  const h12 = hour % 12 || 12;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${h12}:${String(minute).padStart(2, '0')}${ampm} – ${d} ${MONTH_SHORT[m - 1]}, ${y}`;
}

function seedFromId(id: string): number {
  let n = 0;
  for (let i = 0; i < id.length; i += 1) n += id.charCodeAt(i) * (i + 1);
  return n;
}

const MOCK_BANKS = ['Moniepoint MFB', 'GTBank', 'Kuda Microfinance', 'Access Bank', 'Opay'];

export function getTransactionById(id: string): InsightTransaction | undefined {
  return ALL_TXNS.find((t) => t.id === id);
}

export function buildReceiptForTransaction(
  txn: InsightTransaction,
  senderName = 'Ikechukwu Ndubueze',
): TransactionReceipt {
  const seed = seedFromId(txn.id);
  const isTransfer = /transfer/i.test(txn.merchant);
  const isIncome = txn.amount < 0;
  const recipient = isTransfer
    ? txn.merchant.replace(/^Transfer to\s+/i, '').trim() || txn.merchant
    : txn.merchant;
  const refSuffix = txn.id.replace(/\D/g, '').slice(-8).padStart(8, '0');
  const sessionSuffix = String(505150102405576300 + seed * 991).slice(0, 18);

  return {
    transactionId: txn.id,
    amount: Math.abs(txn.amount),
    dateLabel: receiptTimeLabel(txn.date, seed),
    sender: isIncome ? txn.merchant.replace(/^Salary —\s*/i, '').trim() : senderName,
    recipient: isIncome ? senderName : recipient,
    recipientBank: isIncome ? undefined : MOCK_BANKS[seed % MOCK_BANKS.length],
    recipientAccount: isIncome ? undefined : String(5052000000 + (seed % 90000000)),
    reference: `trx_${refSuffix}${txn.id.slice(-4)}Ud`,
    sessionId: sessionSuffix,
  };
}

export function formatReceiptShareText(receipt: TransactionReceipt): string {
  const lines = [
    'Udara — Transaction Receipt',
    '',
    `Amount: ${formatNaira(receipt.amount)}`,
    `Date: ${receipt.dateLabel}`,
    `Sender: ${receipt.sender}`,
    `Recipient: ${receipt.recipient}`,
  ];
  if (receipt.recipientBank) lines.push(`Recipient bank: ${receipt.recipientBank}`);
  if (receipt.recipientAccount) lines.push(`Recipient account: ${receipt.recipientAccount}`);
  lines.push(
    `Reference: ${receipt.reference}`,
    `Session ID: ${receipt.sessionId}`,
    '',
    `For support: ${SUPPORT_EMAIL}`,
  );
  return lines.join('\n');
}

export function addCadenceToDate(iso: string, cadence: Cadence): string {
  const d = new Date(iso + 'T12:00:00');
  if (cadence === 'weekly') d.setDate(d.getDate() + 7);
  else if (cadence === 'yearly') d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

/** Next renewal on or after today, stepping from start by cadence. */
export function nextRenewalFromStart(startDate: string, cadence: Cadence, today = '2026-08-26') {
  let cursor = startDate;
  let guard = 0;
  while (cursor < today && guard < 120) {
    cursor = addCadenceToDate(cursor, cadence);
    guard += 1;
  }
  // If start is in the future, first charge is the start date
  if (startDate > today) {
    return { display: formatDisplayDate(startDate), sort: startDate };
  }
  return { display: formatDisplayDate(cursor), sort: cursor };
}

export const MockSubscriptions: MockSubscription[] = [
  {
    id: 's1',
    name: 'Netflix',
    company: 'Netflix',
    amount: 5500,
    cadence: 'monthly',
    startDate: '2025-09-22',
    nextRenewal: 'Sep 22',
    nextRenewalSort: '2026-09-22',
  },
  {
    id: 's2',
    name: 'Spotify',
    company: 'Spotify',
    amount: 1900,
    cadence: 'monthly',
    startDate: '2025-03-15',
    nextRenewal: 'Sep 15',
    nextRenewalSort: '2026-09-15',
  },
  {
    id: 's3',
    name: 'DStv Compact',
    company: 'MultiChoice',
    amount: 24000,
    cadence: 'monthly',
    startDate: '2024-09-08',
    nextRenewal: 'Sep 8',
    nextRenewalSort: '2026-09-08',
  },
  {
    id: 's4',
    name: 'Showmax',
    company: 'MultiChoice',
    amount: 3200,
    cadence: 'monthly',
    startDate: '2026-01-12',
    nextRenewal: 'Sep 12',
    nextRenewalSort: '2026-09-12',
  },
  {
    id: 's5',
    name: 'iCloud+',
    company: 'Apple',
    amount: 1500,
    cadence: 'monthly',
    startDate: '2025-09-05',
    nextRenewal: 'Sep 5',
    nextRenewalSort: '2026-09-05',
  },
  {
    id: 's6',
    name: 'ChatGPT Plus',
    company: 'OpenAI',
    amount: 30000,
    cadence: 'monthly',
    startDate: '2026-02-18',
    nextRenewal: 'Sep 18',
    nextRenewalSort: '2026-09-18',
  },
  {
    id: 's7',
    name: 'Adobe CC',
    company: 'Adobe',
    amount: 28000,
    cadence: 'monthly',
    startDate: '2025-06-01',
    nextRenewal: 'Sep 1',
    nextRenewalSort: '2026-09-01',
    active: false,
  },
];

let liveSubscriptions: MockSubscription[] = MockSubscriptions;

export function setLiveSubscriptions(subs: MockSubscription[]) {
  liveSubscriptions = subs;
}

export function getSubscriptionById(id: string): MockSubscription | undefined {
  return liveSubscriptions.find((s) => s.id === id);
}

export function cadenceLabel(cadence: Cadence): string {
  if (cadence === 'weekly') return 'Weekly';
  if (cadence === 'yearly') return 'Yearly';
  return 'Monthly';
}

export function annualizedSubscriptionCost(amount: number, cadence: Cadence): number {
  if (cadence === 'yearly') return amount;
  if (cadence === 'weekly') return Math.round(amount * 52);
  return amount * 12;
}

export type InsightCompany = {
  name: string;
  count: number;
  amount: number;
};

export function buildBillStats(bills: UpcomingBill[]) {
  const total = bills.reduce((s, b) => s + b.amount, 0);
  const count = bills.length;
  const avg = count ? Math.round(total / count) : 0;
  const dated = bills
    .filter((b) => b.dueSort)
    .sort((a, b) => (a.dueSort! < b.dueSort! ? -1 : 1));
  const next = dated[0] ?? null;
  const ranking = [...bills].sort((a, b) => b.amount - a.amount);
  const upcoming = [...dated, ...bills.filter((b) => !b.dueSort)];
  return { total, count, avg, next, ranking, upcoming };
}

export function buildSubscriptionStats(subs: MockSubscription[]) {
  const total = subs.reduce((s, x) => s + x.amount, 0);
  const count = subs.length;
  const avg = count ? Math.round(total / count) : 0;
  const upcoming = [...subs].sort((a, b) =>
    a.nextRenewalSort < b.nextRenewalSort ? -1 : 1,
  );
  const renewalsSoon = upcoming.slice(0, 3).length;
  const companies = Object.values(
    subs.reduce<Record<string, InsightCompany>>((acc, s) => {
      const cur = acc[s.company] ?? { name: s.company, count: 0, amount: 0 };
      cur.count += 1;
      cur.amount += s.amount;
      acc[s.company] = cur;
      return acc;
    }, {}),
  ).sort((a, b) => b.amount - a.amount);
  return { total, count, avg, upcoming, renewalsSoon, companies };
}

/** Copilot-style labels + tint for category rows. */
export const CATEGORY_META: Record<
  string,
  { label: string; tint: string; icon: string }
> = {
  Food: { label: 'Restaurants & Food Orders', tint: '#3b82f6', icon: '🍔' },
  Groceries: { label: 'Groceries', tint: '#10b981', icon: '🛒' },
  Shopping: { label: 'Shopping', tint: '#f59e0b', icon: '🛍️' },
  Transport: { label: 'Transport', tint: '#6366f1', icon: '🚗' },
  Travel: { label: 'Travel', tint: '#8b5cf6', icon: '✈️' },
  Utilities: { label: 'Utilities', tint: '#0ea5e9', icon: '⚡' },
  Subscriptions: { label: 'Subscriptions', tint: '#ec4899', icon: '📺' },
  Health: { label: 'Health & Wellness', tint: '#ef4444', icon: '💊' },
  Family: { label: 'Family & Transfers', tint: '#14b8a6', icon: '👨‍👩‍👧' },
  Entertainment: { label: 'Entertainment', tint: '#a855f7', icon: '🎬' },
};

export type InsightRecipient = {
  name: string;
  count: number;
  amount: number;
};

export type InsightSubscription = {
  name: string;
  category: string;
  amount: number;
  lastDate: string;
};

export function buildRecipients(txns: InsightTransaction[]): InsightRecipient[] {
  const map = txns
    .filter((t) => t.amount > 0)
    .reduce<Record<string, InsightRecipient>>((acc, t) => {
      const cur = acc[t.merchant] ?? { name: t.merchant, count: 0, amount: 0 };
      cur.count += 1;
      cur.amount += t.amount;
      acc[t.merchant] = cur;
      return acc;
    }, {});
  return Object.values(map).sort((a, b) => b.amount - a.amount);
}

const SUBSCRIPTION_CATEGORIES = new Set(['Subscriptions', 'Utilities']);
const SUBSCRIPTION_MERCHANTS = /netflix|spotify|dstv|mtn|airtel|glo/i;

export function buildSubscriptions(txns: InsightTransaction[]): InsightSubscription[] {
  const map = txns
    .filter(
      (t) =>
        t.amount > 0 &&
        (SUBSCRIPTION_CATEGORIES.has(t.category) || SUBSCRIPTION_MERCHANTS.test(t.merchant)),
    )
    .reduce<Record<string, InsightSubscription>>((acc, t) => {
      const cur = acc[t.merchant] ?? {
        name: t.merchant,
        category: t.category,
        amount: 0,
        lastDate: t.date,
      };
      cur.amount += t.amount;
      if (t.date > cur.lastDate) cur.lastDate = t.date;
      acc[t.merchant] = cur;
      return acc;
    }, {});
  return Object.values(map).sort((a, b) => b.amount - a.amount);
}

export type SpendSeriesPoint = {
  date: string;
  /** Cumulative outflow through this day (inclusive). */
  cumulative: number;
};

const ANCHOR = '2026-08-26';

const PERIOD_WINDOW: Record<Exclude<InsightPeriod, 'custom'>, number> = {
  day: 1,
  week: 7,
  month: 31,
};

function daysAgo(iso: string, from = ANCHOR): number {
  const a = new Date(from).getTime();
  const b = new Date(iso).getTime();
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function eachDayInclusive(start: string, end: string): string[] {
  const out: string[] = [];
  let cur = start;
  while (cur <= end) {
    out.push(cur);
    cur = addDays(cur, 1);
    if (out.length > 400) break;
  }
  return out;
}

function rangeForPeriod(
  period: InsightPeriod,
  customRange?: CustomDateRange,
): { start: string; end: string } {
  if (period === 'custom' && customRange) return customRange;
  if (period === 'day') return { start: ANCHOR, end: ANCHOR };
  if (period === 'week') return { start: addDays(ANCHOR, -6), end: ANCHOR };
  return { start: addDays(ANCHOR, -30), end: ANCHOR };
}

/** Cumulative daily spend from outflows — powers the Insights chart. */
export function buildSpendSeries(
  outflows: InsightTransaction[],
  start: string,
  end: string,
): SpendSeriesPoint[] {
  const byDay = outflows.reduce<Record<string, number>>((acc, t) => {
    acc[t.date] = (acc[t.date] ?? 0) + t.amount;
    return acc;
  }, {});

  let running = 0;
  return eachDayInclusive(start, end).map((date) => {
    running += byDay[date] ?? 0;
    return { date, cumulative: running };
  });
}

export function getInsightsForPeriod(
  period: InsightPeriod,
  customRange?: CustomDateRange,
) {
  const { start, end } = rangeForPeriod(period, customRange);
  const txns =
    period === 'custom' && customRange
      ? ALL_TXNS.filter((t) => t.date >= customRange.start && t.date <= customRange.end)
      : ALL_TXNS.filter(
          (t) => daysAgo(t.date) < PERIOD_WINDOW[period as Exclude<InsightPeriod, 'custom'>],
        );
  const outflows = txns.filter((t) => t.amount > 0);
  const inflows = txns.filter((t) => t.amount < 0);
  const spent = outflows.reduce((s, t) => s + t.amount, 0);
  const earned = inflows.reduce((s, t) => s + Math.abs(t.amount), 0);
  const budgeted =
    period === 'day'
      ? 25_000
      : period === 'week'
        ? 175_000
        : period === 'custom'
          ? 1_200_000
          : 650_000;
  const left = budgeted - spent;
  const toReview = outflows.filter((t) => t.needsReview);

  const byCategory = outflows.reduce<Record<string, { amount: number; count: number }>>(
    (acc, t) => {
      const cur = acc[t.category] ?? { amount: 0, count: 0 };
      cur.amount += t.amount;
      cur.count += 1;
      acc[t.category] = cur;
      return acc;
    },
    {},
  );

  const categories = Object.entries(byCategory)
    .map(([name, { amount, count }]) => ({ name, amount, count }))
    .sort((a, b) => b.amount - a.amount);

  const periodLabel =
    period === 'day'
      ? 'Today'
      : period === 'week'
        ? 'This week'
        : period === 'custom'
          ? 'Custom range'
          : 'This month';

  const spendSeries = buildSpendSeries(outflows, start, end);
  const sortedTxns = [...txns].sort((a, b) => (a.date < b.date ? 1 : -1));

  /** Liquid cash on hand — mock treasury balance for runway math. */
  const liquidCash = 4_200_000;
  const daySpan = Math.max(1, daysAgo(start, end) + 1);
  const dailyBurn = spent / daySpan;
  const runwayDays = dailyBurn > 0 ? liquidCash / dailyBurn : 999;
  const runwayWeeks = runwayDays / 7;
  const freeCash = earned - spent;
  const billsDue = MockUpcomingFromBills.reduce((s, b) => s + b.amount, 0);
  const udara = computeUdaraScore({
    runwayWeeks,
    earned,
    spent,
    budgeted,
    liquidCash,
    billsDue,
    reviewCount: toReview.length,
    txnCount: outflows.length,
  });

  const runwayLabel =
    runwayWeeks >= 52
      ? `${(runwayWeeks / 52).toFixed(1)} yr`
      : runwayWeeks >= 10
        ? `${Math.round(runwayWeeks)} wk`
        : `${runwayWeeks.toFixed(1)} wk`;

  return {
    periodLabel,
    spent,
    budgeted,
    left,
    earned,
    earnedLast: period === 'month' ? 850000 : period === 'week' ? 0 : 0,
    txns: sortedTxns,
    toReview,
    categories,
    recipients: buildRecipients(sortedTxns),
    subscriptions: buildSubscriptions(sortedTxns),
    overBy: left < 0 ? Math.abs(left) : 0,
    spendSeries,
    rangeStart: start,
    rangeEnd: end,
    advisor: {
      runway: runwayLabel,
      runwayWeeks,
      runwayHint: 'at current burn',
      freeCash,
      freeCashHint: freeCash >= 0 ? 'surplus this period' : 'deficit this period',
      earned,
      udaraScore: udara.score,
      udaraHint: 'overall health',
      liquidCash,
      dailyBurn: Math.round(dailyBurn),
      billsDue,
    },
  };
}

/**
 * Udara Score (0–100) — composite financial health across:
 * runway, cash-flow surplus, budget pace, bill coverage, review hygiene.
 */
export function computeUdaraScore(input: {
  runwayWeeks: number;
  earned: number;
  spent: number;
  budgeted: number;
  liquidCash: number;
  billsDue: number;
  reviewCount: number;
  txnCount: number;
}): { score: number; status: string } {
  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  // 12+ weeks runway → 100; 4 weeks → ~50; under 2 → weak
  const runwayScore = clamp((input.runwayWeeks / 12) * 100);

  // Keep ≥20% of income → strong; deficit → weak
  const surplusRatio =
    input.earned > 0 ? (input.earned - input.spent) / input.earned : input.spent === 0 ? 1 : -1;
  const cashFlowScore = clamp(50 + surplusRatio * 100);

  // Under budget → high; at budget → ~70; 20%+ over → low
  const budgetRatio = input.budgeted > 0 ? input.spent / input.budgeted : 1;
  const budgetScore = clamp(100 - Math.max(0, budgetRatio - 0.7) * 200);

  // Liquid covers upcoming bills 3×+ → strong
  const cover = input.billsDue > 0 ? input.liquidCash / input.billsDue : 4;
  const coverageScore = clamp((cover / 4) * 100);

  // Few unreviewed txns → cleaner books
  const reviewRatio =
    input.txnCount > 0 ? input.reviewCount / input.txnCount : 0;
  const hygieneScore = clamp(100 - reviewRatio * 120);

  const score = Math.round(
    runwayScore * 0.28 +
      cashFlowScore * 0.24 +
      budgetScore * 0.22 +
      coverageScore * 0.16 +
      hygieneScore * 0.1,
  );

  const status =
    score >= 80 ? 'Strong' : score >= 65 ? 'Stable' : score >= 45 ? 'Watch' : 'Tight';

  return { score, status };
}
