import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { SegmentRail } from '@/components/insights/SegmentRail';
import { bucketStyles as styles } from '@/components/savings/bucketStyles';
import { SavingsBucketScroll } from '@/components/savings/SavingsBucketScroll';
import { SavingsPlansRing } from '@/components/savings/SavingsPlansRing';
import { SavingsStartRecommendations } from '@/components/savings/SavingsStartRecommendations';
import {
  onCustomCreate,
  useAutoSaveRecommendations,
} from '@/components/savings/useSavingsRecommendations';
import { GlassPressable } from '@/components/ui/GlassPressable';
import { MoneyMovementRow } from '@/components/ui/MoneyMovementRow';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import type { SavingsActivity } from '@/constants/MockData';
import { autoSavePlansFromItems } from '@/constants/AutoSavePlans';
import { SavingsBucketTheme } from '@/constants/SavingsTheme';
import type { SavingsMovementRecord } from '@/constants/SavingsActivity';
import {
  movementSubtitle,
  resolveSavingsStatus,
} from '@/constants/TransactionStatus';
import { activityRowSubtitle } from '@/helpers/groupSavingsActivity';

type AutoSaveFilter = 'plans' | 'activity';

const AUTO_SAVE_FILTER = [
  { key: 'plans' as const, label: 'Active plans' },
  { key: 'activity' as const, label: 'Activity' },
];

type Props = {
  balance: number;
  plans: SavingsActivity[];
  formatAmount: (amount: number) => string;
  recentActivity: SavingsMovementRecord[];
  onQuickSave: () => void;
  onStartCreate: (templateId?: string) => void;
  onOpenPlan: (planId: string) => void;
  onOpenActivity: (activityId: string) => void;
};

function statusSummary(plans: SavingsActivity[]): string {
  const active = plans.filter((p) => p.status !== 'failed' && p.direction !== 'out').length;
  const pending = plans.filter((p) => p.status === 'pending').length;
  const next = plans.find((p) => /every/i.test(p.meta))?.meta.replace('Every ', '') ?? null;

  const parts: string[] = [];
  if (active > 0) parts.push(`${active} active`);
  if (next) parts.push(`Next ${next}`);
  if (pending > 0) parts.push(`${pending} pending`);
  return parts.join(' · ') || 'No plans yet';
}

function PlanRow({
  plan,
  formatAmount,
  accent,
  iconBg,
  onPress,
}: {
  plan: SavingsActivity;
  formatAmount: (n: number) => string;
  accent: string;
  iconBg: string;
  onPress: () => void;
}) {
  const status = resolveSavingsStatus(plan);
  const pending = status === 'pending';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.planRow, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={plan.label}>
      <View style={[styles.planIcon, { backgroundColor: iconBg }]}>
        <Ionicons name="flash-outline" size={16} color={accent} />
      </View>
      <View style={styles.planCopy}>
        <Text style={styles.planTitle}>{plan.label}</Text>
        <Text style={[styles.planMeta, pending && styles.planMetaPending]}>{plan.meta}</Text>
      </View>
      <Text style={[styles.planAmount, pending && styles.planAmountPending]}>
        {formatAmount(plan.amount)}
      </Text>
    </Pressable>
  );
}

export function AutoSaveBucketView({
  balance,
  plans,
  formatAmount,
  recentActivity,
  onQuickSave,
  onStartCreate,
  onOpenPlan,
  onOpenActivity,
}: Props) {
  const [filter, setFilter] = useState<AutoSaveFilter>('plans');
  const theme = SavingsBucketTheme['auto-save'];
  const summary = statusSummary(plans);

  const ringPlans = useMemo(() => autoSavePlansFromItems(plans), [plans]);
  const recommendations = useAutoSaveRecommendations(onStartCreate);

  return (
    <SavingsBucketScroll>
      <SavingsPlansRing
        plans={ringPlans}
        total={balance}
        formatAmount={formatAmount}
        totalLabel="TOTAL SAVED"
        countLabel={() => summary}
        fallbackAccent={theme.accent}
        onPlanPress={onOpenPlan}
      />

      <SavingsStartRecommendations
        title="Start a plan"
        leftColumn="Plan"
        rightColumn="Schedule"
        rows={recommendations}
        bucket="auto-save"
        accentColor={theme.accent}
        customActionLabel="Start"
        onCustomPress={onCustomCreate(onStartCreate)}
      />

      <GlassPressable
        label="Quick Save"
        onPress={onQuickSave}
        accessibilityLabel="Quick Save"
      />

      <View style={styles.filterBlock}>
        <SegmentRail
          items={AUTO_SAVE_FILTER}
          value={filter}
          onChange={setFilter}
          accentColor={theme.accent}
        />
        <LiquidGlass style={styles.listCard} intensity={44} contentStyle={styles.listInner}>
          {filter === 'plans' ? (
            plans.length === 0 ? (
              <Text style={styles.empty}>No plans yet — pick one above to start.</Text>
            ) : (
              plans.map((plan, i) => (
                <View key={plan.id} style={i < plans.length - 1 ? styles.rowBorder : undefined}>
                  <PlanRow
                    plan={plan}
                    formatAmount={formatAmount}
                    accent={theme.accent}
                    iconBg={theme.iconBg}
                    onPress={() => onOpenPlan(plan.id)}
                  />
                </View>
              ))
            )
          ) : null}

          {filter === 'activity' ? (
            recentActivity.length === 0 ? (
              <Text style={styles.empty}>No moves yet — your next auto-save will show here.</Text>
            ) : (
              recentActivity.map((item, i) => {
                const status = resolveSavingsStatus(item);
                return (
                  <View
                    key={item.id}
                    style={[styles.rowWrap, i < recentActivity.length - 1 && styles.rowBorder]}>
                    <MoneyMovementRow
                      title={item.label}
                      subtitle={
                        item.occurredAt
                          ? activityRowSubtitle(item, status)
                          : movementSubtitle([item.when], status)
                      }
                      amount={item.amount}
                      status={status}
                      direction={item.direction ?? 'in'}
                      avatarLetter={item.category}
                      avatarBg={theme.iconBg}
                      avatarTextColor={theme.accent}
                      formatAmount={formatAmount}
                      onPress={() => onOpenActivity(item.id)}
                    />
                  </View>
                );
              })
            )
          ) : null}
        </LiquidGlass>
      </View>
    </SavingsBucketScroll>
  );
}
