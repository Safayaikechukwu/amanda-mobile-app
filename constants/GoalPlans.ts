import { CUSTOM_SAVINGS_TEMPLATE_ID } from '@/constants/SavingsTemplates';

export type GoalTemplate = {
  id: string;
  title: string;
  targetHint: string;
};

export type GoalPlanColor = {
  id: string;
  color: string;
  bg: string;
};

export type GoalPlan = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  colorBg: string;
  amount: number;
  targetAmount: number;
  dueLabel: string;
  templateId: string;
  status: 'ongoing' | 'finished';
  createdAt?: string;
};

export const GOAL_TEMPLATES: GoalTemplate[] = [
  { id: 'emergency', title: 'Emergency fund', targetHint: '₦500,000+' },
  { id: 'rent', title: 'Rent buffer', targetHint: '₦450,000' },
  { id: 'trip', title: 'Trip / travel', targetHint: 'Any amount' },
  { id: 'wedding', title: 'Wedding / event', targetHint: '₦1M+' },
];

export const GOAL_PLAN_COLORS: GoalPlanColor[] = [
  { id: 'amber', color: '#9A6B35', bg: '#F0E8DC' },
  { id: 'green', color: '#2A7D62', bg: '#E6F4EF' },
  { id: 'rose', color: '#B83A5E', bg: '#FBEAF0' },
  { id: 'purple', color: '#6B4FA0', bg: '#F0EBF8' },
  { id: 'blue', color: '#4568A6', bg: '#E8EEF7' },
  { id: 'teal', color: '#1A7A7A', bg: '#E5F4F4' },
];

export const MOCK_GOAL_ONGOING: GoalPlan[] = [
  {
    id: 'gb1',
    title: 'Emergency fund',
    emoji: '🛡️',
    color: '#2A7D62',
    colorBg: '#E6F4EF',
    amount: 145000,
    targetAmount: 500000,
    dueLabel: 'Due Dec 2026',
    templateId: 'emergency',
    status: 'ongoing',
    createdAt: '2026-03-10T09:00:00',
  },
  {
    id: 'gb2',
    title: 'Rent buffer',
    emoji: '🏠',
    color: '#9A6B35',
    colorBg: '#F0E8DC',
    amount: 320000,
    targetAmount: 450000,
    dueLabel: 'Due Oct 2026',
    templateId: 'rent',
    status: 'ongoing',
    createdAt: '2026-01-15T09:00:00',
  },
];

export const MOCK_GOAL_FINISHED: GoalPlan[] = [
  {
    id: 'gb-done-1',
    title: 'New laptop',
    emoji: '💻',
    color: '#6B4FA0',
    colorBg: '#F0EBF8',
    amount: 350000,
    targetAmount: 350000,
    dueLabel: 'Completed · Jun 2026',
    templateId: 'custom',
    status: 'finished',
    createdAt: '2025-09-01T09:00:00',
  },
];

export function progressPct(plan: GoalPlan): number {
  if (plan.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((plan.amount / plan.targetAmount) * 100));
}

export function remainingForGoal(plan: GoalPlan): number {
  return Math.max(0, plan.targetAmount - plan.amount);
}

export function goalCreateChatMessage(templateId?: string): string {
  if (!templateId || templateId === CUSTOM_SAVINGS_TEMPLATE_ID) {
    return templateId === CUSTOM_SAVINGS_TEMPLATE_ID
      ? 'I want to create my own savings goal'
      : 'I want to create a savings goal';
  }
  const template = GOAL_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return 'I want to create a savings goal';
  return `I want to create a savings goal for ${template.title.toLowerCase()}`;
}

/** Opens chat for top-ups, early break, target changes, etc. */
export function goalAskUdaraChatMessage(goal: GoalPlan): string {
  return `I want to update my ${goal.title.toLowerCase()} savings goal`;
}

let liveOngoing: GoalPlan[] = MOCK_GOAL_ONGOING;
let liveFinished: GoalPlan[] = MOCK_GOAL_FINISHED;

export function setLiveGoalPlans(ongoing: GoalPlan[], finished: GoalPlan[]) {
  liveOngoing = ongoing;
  liveFinished = finished;
}

export function getGoalPlanById(planId: string): GoalPlan | undefined {
  return liveOngoing.find((p) => p.id === planId) ?? liveFinished.find((p) => p.id === planId);
}
