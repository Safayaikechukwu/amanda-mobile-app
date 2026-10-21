import { CUSTOM_SAVINGS_TEMPLATE_ID } from '@/constants/SavingsTemplates';

export type SpendSaveRule = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  colorBg: string;
  amount: number;
  meta: string;
  status: 'active' | 'paused';
};

export type SpendSaveTemplate = {
  id: string;
  title: string;
  hint: string;
};

export const SPEND_SAVE_TEMPLATES: SpendSaveTemplate[] = [
  { id: 'round-up', title: 'Round-ups', hint: 'Per transaction' },
  { id: 'spend-match', title: 'Spend match', hint: '1–10% of spend' },
  { id: 'cap-daily', title: 'Daily cap', hint: 'Max per day' },
];

export const MOCK_SPEND_SAVE_ACTIVE: SpendSaveRule[] = [
  {
    id: 'ss-round',
    title: 'Round-ups',
    emoji: '🔄',
    color: '#7A2E35',
    colorBg: '#F3E6E7',
    amount: 18500,
    meta: 'This month',
    status: 'active',
  },
  {
    id: 'ss-match',
    title: 'Spend match 5%',
    emoji: '💳',
    color: '#B83A5E',
    colorBg: '#FBEAF0',
    amount: 110000,
    meta: 'Active',
    status: 'active',
  },
];

export function spendSaveCreateChatMessage(templateId?: string): string {
  if (!templateId || templateId === CUSTOM_SAVINGS_TEMPLATE_ID) {
    return templateId === CUSTOM_SAVINGS_TEMPLATE_ID
      ? 'I want to create my own Spend & Save rule'
      : 'I want to set up a Spend & Save rule';
  }
  const template = SPEND_SAVE_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return 'I want to set up a Spend & Save rule';
  return `I want to set up Spend & Save for ${template.title.toLowerCase()}`;
}

export function spendSaveAskUdaraChatMessage(rule: SpendSaveRule): string {
  return `I want to update my ${rule.title.toLowerCase()} spend & save rule`;
}

let liveRules: SpendSaveRule[] = MOCK_SPEND_SAVE_ACTIVE;

export function setLiveSpendSaveRules(rules: SpendSaveRule[]) {
  liveRules = rules;
}

export function getSpendSaveRuleById(ruleId: string): SpendSaveRule | undefined {
  return liveRules.find((r) => r.id === ruleId);
}
