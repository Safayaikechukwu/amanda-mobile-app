import type { SavingsActivity } from '@/constants/MockData';
import { CUSTOM_SAVINGS_TEMPLATE_ID } from '@/constants/SavingsTemplates';
import { resolveSavingsStatus } from '@/constants/TransactionStatus';

export const AUTO_SAVE_PLAN_COLORS = [
  { color: '#2A7D62', bg: '#E2F0EA', emoji: '⚡' },
  { color: '#4568A6', bg: '#E6ECF6', emoji: '📅' },
  { color: '#9A6B35', bg: '#F0E8DC', emoji: '💰' },
  { color: '#6B4FA0', bg: '#F0EBF8', emoji: '🔄' },
] as const;

export type AutoSaveTemplate = {
  id: string;
  title: string;
  hint: string;
};

export const AUTO_SAVE_TEMPLATES: AutoSaveTemplate[] = [
  { id: 'weekly', title: 'Weekly save', hint: 'Every week' },
  { id: 'payday', title: 'Payday', hint: 'When salary lands' },
  { id: 'daily', title: 'Daily', hint: 'Every day' },
];

export function autoSaveCreateChatMessage(templateId?: string): string {
  if (!templateId || templateId === CUSTOM_SAVINGS_TEMPLATE_ID) {
    return templateId === CUSTOM_SAVINGS_TEMPLATE_ID
      ? 'I want to create my own Auto Save plan'
      : 'I want to set up an Auto Save plan';
  }
  const template = AUTO_SAVE_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return 'I want to set up an Auto Save plan';
  return `I want to set up Auto Save for ${template.title.toLowerCase()}`;
}

export type AutoSavePlan = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  colorBg: string;
  amount: number;
  scheduleLabel: string;
  statusLabel: string;
  pending: boolean;
};

export function autoSavePlanFromItem(item: SavingsActivity, index: number): AutoSavePlan {
  const palette = AUTO_SAVE_PLAN_COLORS[index % AUTO_SAVE_PLAN_COLORS.length];
  const pending = resolveSavingsStatus(item) === 'pending';
  return {
    id: item.id,
    title: item.label,
    emoji: palette.emoji,
    color: palette.color,
    colorBg: palette.bg,
    amount: item.amount,
    scheduleLabel: item.meta,
    statusLabel: pending ? 'Pending' : 'Active',
    pending,
  };
}

export function autoSavePlansFromItems(items: SavingsActivity[]): AutoSavePlan[] {
  return items
    .filter((p) => p.status !== 'failed' && p.direction !== 'out')
    .map((item, index) => autoSavePlanFromItem(item, index));
}

export function autoSaveAskUdaraChatMessage(plan: AutoSavePlan): string {
  return `I want to update my ${plan.title.toLowerCase()} auto save plan`;
}

let livePlans: AutoSavePlan[] = [];

export function setLiveAutoSavePlans(plans: AutoSavePlan[]) {
  livePlans = plans;
}

export function getAutoSavePlanById(planId: string): AutoSavePlan | undefined {
  return livePlans.find((p) => p.id === planId);
}
