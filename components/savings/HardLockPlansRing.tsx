import type { HardLockPlan } from '@/constants/HardLockPlans';
import { SavingsBucketTheme } from '@/constants/SavingsTheme';

import { SavingsPlansRing } from '@/components/savings/SavingsPlansRing';

type Props = {
  plans: HardLockPlan[];
  total: number;
  formatAmount: (amount: number) => string;
  onPlanPress?: (planId: string) => void;
};

export function HardLockPlansRing({ plans, total, formatAmount, onPlanPress }: Props) {
  return (
    <SavingsPlansRing
      plans={plans}
      total={total}
      formatAmount={formatAmount}
      onPlanPress={onPlanPress}
      totalLabel="TOTAL LOCKED"
      countLabel={(n) =>
        n === 0 ? 'No active plans' : `${n} active plan${n === 1 ? '' : 's'}`
      }
      fallbackAccent={SavingsBucketTheme.hardlock.accent}
    />
  );
}
