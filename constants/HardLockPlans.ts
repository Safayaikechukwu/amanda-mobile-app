import { CUSTOM_SAVINGS_TEMPLATE_ID } from '@/constants/SavingsTemplates';

export type HardLockTier = {
  id: string;
  rateLabel: string;
  durationLabel: string;
  /** Typical lock length used for unlock date preview. */
  typicalDays: number;
};

export type HardLockPlanColor = {
  id: string;
  color: string;
  bg: string;
};

export type HardLockPlan = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  colorBg: string;
  amount: number;
  rateLabel: string;
  unlockLabel: string;
  tierId: string;
  status: 'ongoing' | 'finished';
  /** When the lock started — used for accrued interest. */
  createdAt?: string;
};

/** Standard HardLock tiers — no invited-only premium tier. */
export const HARDLOCK_TIERS: HardLockTier[] = [
  { id: 't15', rateLabel: '15% p.a.', durationLabel: '7–60 days', typicalDays: 60 },
  { id: 't16', rateLabel: '16% p.a.', durationLabel: '61–180 days', typicalDays: 180 },
  { id: 't17', rateLabel: '17% p.a.', durationLabel: '181–364 days', typicalDays: 364 },
  { id: 't18', rateLabel: '18% p.a.', durationLabel: '365–1000 days', typicalDays: 365 },
];

export const HARDLOCK_PLAN_COLORS: HardLockPlanColor[] = [
  { id: 'blue', color: '#4568A6', bg: '#E8EEF7' },
  { id: 'green', color: '#2A7D62', bg: '#E6F4EF' },
  { id: 'purple', color: '#6B4FA0', bg: '#F0EBF8' },
  { id: 'orange', color: '#C45C26', bg: '#FBEEE6' },
  { id: 'rose', color: '#B83A5E', bg: '#FBEAF0' },
  { id: 'teal', color: '#1A7A7A', bg: '#E5F4F4' },
];

export const HARDLOCK_PLAN_EMOJIS = [
  '🔒',
  '🎯',
  '🏠',
  '✈️',
  '🎓',
  '💼',
  '🚗',
  '🎁',
  '💰',
  '🌴',
  '📱',
  '⚡',
];

export const MOCK_HARDLOCK_ONGOING: HardLockPlan[] = [
  {
    id: 'sl1',
    title: 'Q4 lock',
    emoji: '🎯',
    color: '#4568A6',
    colorBg: '#E8EEF7',
    amount: 300000,
    rateLabel: '17% p.a.',
    unlockLabel: 'Unlocks Dec 2026',
    tierId: 't17',
    status: 'ongoing',
    createdAt: '2026-06-01T09:00:00',
  },
  {
    id: 'sl2',
    title: '90-day lock',
    emoji: '🔒',
    color: '#6B4FA0',
    colorBg: '#F0EBF8',
    amount: 200000,
    rateLabel: '16% p.a.',
    unlockLabel: 'Unlocks Nov 2026',
    tierId: 't16',
    status: 'ongoing',
    createdAt: '2026-05-20T09:00:00',
  },
];

export const MOCK_HARDLOCK_FINISHED: HardLockPlan[] = [
  {
    id: 'sl-done-1',
    title: 'Holiday stash',
    emoji: '🎁',
    color: '#C45C26',
    colorBg: '#FBEEE6',
    amount: 75000,
    rateLabel: '15% p.a.',
    unlockLabel: 'Completed · Jul 2026',
    tierId: 't15',
    status: 'finished',
    createdAt: '2026-04-01T09:00:00',
  },
  {
    id: 'sl-done-2',
    title: 'Emergency top-up',
    emoji: '💰',
    color: '#2A7D62',
    colorBg: '#E6F4EF',
    amount: 120000,
    rateLabel: '16% p.a.',
    unlockLabel: 'Completed · May 2026',
    tierId: 't16',
    status: 'finished',
    createdAt: '2025-11-15T09:00:00',
  },
];

export const HARDLOCK_MAX_RATE = '18% p.a.';

export function tierForId(tierId: string): HardLockTier {
  return HARDLOCK_TIERS.find((t) => t.id === tierId) ?? HARDLOCK_TIERS[0];
}

export function unlockLabelForTier(tierId: string, from = new Date()): string {
  const tier = tierForId(tierId);
  const unlock = new Date(from);
  unlock.setDate(unlock.getDate() + tier.typicalDays);
  const label = unlock.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  return `Unlocks ${label}`;
}

/** Parse "17% p.a." → 0.17 */
export function parseAnnualRate(rateLabel: string): number {
  const match = rateLabel.match(/([\d.]+)/);
  return match ? Number(match[1]) / 100 : 0;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function lockDaysForPlan(plan: HardLockPlan, asOf: Date): number {
  if (plan.status === 'finished') {
    return tierForId(plan.tierId).typicalDays;
  }
  if (plan.createdAt) {
    const start = new Date(plan.createdAt);
    return Math.max(0, (asOf.getTime() - start.getTime()) / MS_PER_DAY);
  }
  return tierForId(plan.tierId).typicalDays * 0.35;
}

/** Simple daily accrual: principal × annual rate × days locked ÷ 365 */
export function accruedInterestForPlan(plan: HardLockPlan, asOf = new Date()): number {
  const rate = parseAnnualRate(plan.rateLabel);
  const days = lockDaysForPlan(plan, asOf);
  return Math.round((plan.amount * rate * days) / 365);
}

export type CreateHardLockPlanPayload = {
  title: string;
  emoji: string;
  color: string;
  colorBg: string;
  tierId: string;
  amount: number;
};

export function hardlockCreateChatMessage(tierId?: string): string {
  if (!tierId || tierId === CUSTOM_SAVINGS_TEMPLATE_ID) {
    return tierId === CUSTOM_SAVINGS_TEMPLATE_ID
      ? 'I want to create my own HardLock plan'
      : 'I want to create a HardLock plan';
  }
  const tier = tierForId(tierId);
  return `I want to create a HardLock plan at ${tier.rateLabel} for ${tier.durationLabel}`;
}

export function buildHardLockPlan(payload: CreateHardLockPlanPayload): HardLockPlan {
  const tier = tierForId(payload.tierId);
  const createdAt = new Date();
  return {
    id: `sl-${Date.now()}`,
    title: payload.title,
    emoji: payload.emoji,
    color: payload.color,
    colorBg: payload.colorBg,
    amount: payload.amount,
    rateLabel: tier.rateLabel,
    unlockLabel: unlockLabelForTier(payload.tierId, createdAt),
    tierId: payload.tierId,
    status: 'ongoing',
    createdAt: createdAt.toISOString(),
  };
}

type HardLockPlanCommitHandler = (plan: HardLockPlan) => void;

let liveOngoing: HardLockPlan[] = MOCK_HARDLOCK_ONGOING;
let liveFinished: HardLockPlan[] = MOCK_HARDLOCK_FINISHED;
let planCommitHandler: HardLockPlanCommitHandler | null = null;

export function registerHardLockPlanCommitHandler(handler: HardLockPlanCommitHandler | null) {
  planCommitHandler = handler;
}

export function commitHardLockPlan(plan: HardLockPlan) {
  liveOngoing = [plan, ...liveOngoing];
  planCommitHandler?.(plan);
}

export function getLiveHardLockPlans() {
  return { ongoing: liveOngoing, finished: liveFinished };
}

export function setLiveHardLockPlans(ongoing: HardLockPlan[], finished: HardLockPlan[]) {
  liveOngoing = ongoing;
  liveFinished = finished;
}

export function getHardLockPlanById(planId: string): HardLockPlan | undefined {
  return liveOngoing.find((p) => p.id === planId) ?? liveFinished.find((p) => p.id === planId);
}

export function listLiveHardLockPlans(): HardLockPlan[] {
  return [...liveOngoing, ...liveFinished];
}
