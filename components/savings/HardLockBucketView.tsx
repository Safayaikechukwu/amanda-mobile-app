import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { SegmentRail } from '@/components/insights/SegmentRail';
import { bucketStyles as styles } from '@/components/savings/bucketStyles';
import { CollapsibleTemplateSection } from '@/components/savings/CollapsibleTemplateSection';
import { HardLockPlansRing } from '@/components/savings/HardLockPlansRing';
import { SavingsBucketScroll } from '@/components/savings/SavingsBucketScroll';
import { SavingsCustomTemplateRow } from '@/components/savings/SavingsCustomTemplateRow';
import { TableActionButton } from '@/components/savings/TableActionButton';
import { MoneyMovementRow } from '@/components/ui/MoneyMovementRow';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import { HARDLOCK_TIERS, type HardLockPlan } from '@/constants/HardLockPlans';
import { CUSTOM_SAVINGS_TEMPLATE_ID } from '@/constants/SavingsTemplates';
import { SavingsBucketTheme } from '@/constants/SavingsTheme';
import type { SavingsMovementRecord } from '@/constants/SavingsActivity';
import {
  movementSubtitle,
  resolveSavingsStatus,
} from '@/constants/TransactionStatus';
import { activityRowSubtitle } from '@/helpers/groupSavingsActivity';

type PlansFilter = 'ongoing' | 'finished' | 'activity';

const PLANS_FILTER = [
  { key: 'ongoing' as const, label: 'Ongoing' },
  { key: 'finished' as const, label: 'Finished' },
  { key: 'activity' as const, label: 'Activity' },
];

type Props = {
  balance: number;
  ongoingPlans: HardLockPlan[];
  finishedPlans: HardLockPlan[];
  formatAmount: (amount: number) => string;
  recentActivity: SavingsMovementRecord[];
  onStartCreate: (tierId?: string) => void;
  onOpenPlan: (planId: string) => void;
  onOpenActivity: (activityId: string) => void;
};

function PlanRow({
  plan,
  formatAmount,
  onPress,
}: {
  plan: HardLockPlan;
  formatAmount: (n: number) => string;
  onPress?: () => void;
}) {
  const finished = plan.status === 'finished';

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.planRow, pressed && onPress && styles.pressed]}
      accessibilityRole={onPress ? 'button' : 'text'}>
      <View style={[styles.planIcon, { backgroundColor: plan.colorBg }]}>
        <Text style={styles.planEmoji}>{plan.emoji}</Text>
      </View>
      <View style={styles.planCopy}>
        <Text style={styles.planTitle}>{plan.title}</Text>
        <Text style={styles.planMeta}>
          {plan.rateLabel} · {plan.unlockLabel}
        </Text>
      </View>
      <Text style={[styles.planAmount, finished && styles.planAmountMuted]}>
        {formatAmount(plan.amount)}
      </Text>
    </Pressable>
  );
}

function ActivityList({
  items,
  theme,
  formatAmount,
  onOpenActivity,
}: {
  items: SavingsMovementRecord[];
  theme: (typeof SavingsBucketTheme)['hardlock'];
  formatAmount: (n: number) => string;
  onOpenActivity: (id: string) => void;
}) {
  if (items.length === 0) {
    return <Text style={styles.empty}>No activity yet — start a lock to see moves here.</Text>;
  }

  return items.map((item, i) => {
    const status = resolveSavingsStatus(item);
    return (
      <View key={item.id} style={[styles.rowWrap, i < items.length - 1 && styles.rowBorder]}>
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
  });
}

export function HardLockBucketView({
  balance,
  ongoingPlans,
  finishedPlans,
  formatAmount,
  recentActivity,
  onStartCreate,
  onOpenPlan,
  onOpenActivity,
}: Props) {
  const [filter, setFilter] = useState<PlansFilter>('ongoing');
  const theme = SavingsBucketTheme.hardlock;

  return (
    <SavingsBucketScroll>
      <HardLockPlansRing
        plans={ongoingPlans}
        total={balance}
        formatAmount={formatAmount}
        onPlanPress={onOpenPlan}
      />

      <CollapsibleTemplateSection title="Choose a plan to start">
        <LiquidGlass style={styles.tableCard} intensity={44} contentStyle={styles.tableInner}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderLabel}>Interest rate</Text>
            <Text style={[styles.tableHeaderLabel, styles.tableHeaderRight]}>Duration</Text>
            <View style={styles.tableHeaderAction} />
          </View>
          {HARDLOCK_TIERS.map((tier) => (
            <View key={tier.id} style={[styles.tableRow, styles.tableRowBorder]}>
              <Text style={[styles.tablePrimary, { color: theme.accent }]}>{tier.rateLabel}</Text>
              <Text style={styles.tableSecondary}>{tier.durationLabel}</Text>
              <View style={styles.tableHeaderAction}>
                <TableActionButton
                  label="Save"
                  onPress={() => onStartCreate(tier.id)}
                  accentColor={theme.accent}
                  accessibilityLabel={`Save with ${tier.rateLabel}`}
                />
              </View>
            </View>
          ))}
          <SavingsCustomTemplateRow
            bucket="hardlock"
            accentColor={theme.accent}
            actionLabel="Save"
            onPress={() => onStartCreate(CUSTOM_SAVINGS_TEMPLATE_ID)}
          />
        </LiquidGlass>
      </CollapsibleTemplateSection>

      <View style={styles.filterBlock}>
        <SegmentRail
          items={PLANS_FILTER}
          value={filter}
          onChange={setFilter}
          accentColor={theme.accent}
        />
        <LiquidGlass style={styles.listCard} intensity={44} contentStyle={styles.listInner}>
          {filter === 'ongoing' ? (
            ongoingPlans.length === 0 ? (
              <Text style={styles.empty}>No ongoing locks — pick a plan above to start.</Text>
            ) : (
              ongoingPlans.map((plan, i) => (
                <View key={plan.id} style={i < ongoingPlans.length - 1 ? styles.rowBorder : undefined}>
                  <PlanRow
                    plan={plan}
                    formatAmount={formatAmount}
                    onPress={() => onOpenPlan(plan.id)}
                  />
                </View>
              ))
            )
          ) : null}

          {filter === 'finished' ? (
            finishedPlans.length === 0 ? (
              <Text style={styles.empty}>No finished locks yet.</Text>
            ) : (
              finishedPlans.map((plan, i) => (
                <View key={plan.id} style={i < finishedPlans.length - 1 ? styles.rowBorder : undefined}>
                  <PlanRow
                    plan={plan}
                    formatAmount={formatAmount}
                    onPress={() => onOpenPlan(plan.id)}
                  />
                </View>
              ))
            )
          ) : null}

          {filter === 'activity' ? (
            <ActivityList
              items={recentActivity}
              theme={theme}
              formatAmount={formatAmount}
              onOpenActivity={onOpenActivity}
            />
          ) : null}
        </LiquidGlass>
      </View>
    </SavingsBucketScroll>
  );
}
