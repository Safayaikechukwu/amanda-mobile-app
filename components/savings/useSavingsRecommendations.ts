import { useMemo } from 'react';

import type { SavingsRecommendationRow } from '@/components/savings/SavingsStartRecommendations';
import {
  AUTO_SAVE_TEMPLATES,
} from '@/constants/AutoSavePlans';
import { GOAL_TEMPLATES } from '@/constants/GoalPlans';
import { HARDLOCK_TIERS } from '@/constants/HardLockPlans';
import { SPEND_SAVE_TEMPLATES } from '@/constants/SpendSaveRules';
import { CUSTOM_SAVINGS_TEMPLATE_ID } from '@/constants/SavingsTemplates';

type OnStartCreate = (templateId?: string) => void;

export function useGoalRecommendations(onStartCreate: OnStartCreate): SavingsRecommendationRow[] {
  return useMemo(
    () =>
      GOAL_TEMPLATES.map((template) => ({
        id: template.id,
        primary: template.title,
        secondary: template.targetHint,
        actionLabel: 'Start',
        onPress: () => onStartCreate(template.id),
        accessibilityLabel: `Start ${template.title}`,
      })),
    [onStartCreate],
  );
}

export function useHardLockRecommendations(onStartCreate: OnStartCreate): SavingsRecommendationRow[] {
  return useMemo(
    () =>
      HARDLOCK_TIERS.map((tier) => ({
        id: tier.id,
        primary: tier.rateLabel,
        secondary: tier.durationLabel,
        actionLabel: 'Save',
        onPress: () => onStartCreate(tier.id),
        accessibilityLabel: `Save with ${tier.rateLabel}`,
      })),
    [onStartCreate],
  );
}

export function useSpendSaveRecommendations(onStartCreate: OnStartCreate): SavingsRecommendationRow[] {
  return useMemo(
    () =>
      SPEND_SAVE_TEMPLATES.map((template) => ({
        id: template.id,
        primary: template.title,
        secondary: template.hint,
        actionLabel: 'Add',
        onPress: () => onStartCreate(template.id),
        accessibilityLabel: `Add ${template.title}`,
      })),
    [onStartCreate],
  );
}

export function useAutoSaveRecommendations(onStartCreate: OnStartCreate): SavingsRecommendationRow[] {
  return useMemo(
    () =>
      AUTO_SAVE_TEMPLATES.map((template) => ({
        id: template.id,
        primary: template.title,
        secondary: template.hint,
        actionLabel: 'Start',
        onPress: () => onStartCreate(template.id),
        accessibilityLabel: `Start ${template.title}`,
      })),
    [onStartCreate],
  );
}

export function onCustomCreate(onStartCreate: OnStartCreate) {
  return () => onStartCreate(CUSTOM_SAVINGS_TEMPLATE_ID);
}
