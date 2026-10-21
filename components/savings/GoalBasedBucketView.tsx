import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { SegmentRail } from '@/components/insights/SegmentRail';
import { bucketStyles as styles } from '@/components/savings/bucketStyles';
import { CollapsibleTemplateSection } from '@/components/savings/CollapsibleTemplateSection';
import { SavingsBucketScroll } from '@/components/savings/SavingsBucketScroll';
import { SavingsCustomTemplateRow } from '@/components/savings/SavingsCustomTemplateRow';
import { SavingsPlansRing } from '@/components/savings/SavingsPlansRing';
import { TableActionButton } from '@/components/savings/TableActionButton';
import { MoneyMovementRow } from '@/components/ui/MoneyMovementRow';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import {
  GOAL_TEMPLATES,
  progressPct,
  type GoalPlan,
} from '@/constants/GoalPlans';
import { CUSTOM_SAVINGS_TEMPLATE_ID } from '@/constants/SavingsTemplates';
import { SavingsBucketTheme } from '@/constants/SavingsTheme';
import type { SavingsMovementRecord } from '@/constants/SavingsActivity';
import {
  movementSubtitle,
  resolveSavingsStatus,
} from '@/constants/TransactionStatus';
import { activityRowSubtitle } from '@/helpers/groupSavingsActivity';

type GoalsFilter = 'ongoing' | 'finished' | 'activity';

const GOALS_FILTER = [
  { key: 'ongoing' as const, label: 'Ongoing' },
  { key: 'finished' as const, label: 'Finished' },
  { key: 'activity' as const, label: 'Activity' },
];

type Props = {
  balance: number;
  ongoingGoals: GoalPlan[];
  finishedGoals: GoalPlan[];
  formatAmount: (amount: number) => string;
  recentActivity: SavingsMovementRecord[];
  onStartCreate: (templateId?: string) => void;
  onOpenGoal: (goalId: string) => void;
  onOpenActivity: (activityId: string) => void;
};

function GoalRow({
  goal,
  formatAmount,
  onPress,
}: {
  goal: GoalPlan;
  formatAmount: (n: number) => string;
  onPress?: () => void;
}) {
  const finished = goal.status === 'finished';
  const pct = progressPct(goal);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.planRow, pressed && onPress && styles.pressed]}
      accessibilityRole={onPress ? 'button' : 'text'}>
      <View style={[styles.planIcon, { backgroundColor: goal.colorBg }]}>
        <Text style={styles.planEmoji}>{goal.emoji}</Text>
      </View>
      <View style={styles.planCopy}>
        <Text style={styles.planTitle}>{goal.title}</Text>
        <Text style={styles.planMeta}>
          {finished ? goal.dueLabel : `${pct}% · ${goal.dueLabel}`}
        </Text>
      </View>
      <Text style={[styles.planAmount, finished && styles.planAmountMuted]}>
        {formatAmount(goal.amount)}
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
  theme: (typeof SavingsBucketTheme)['goal-based'];
  formatAmount: (n: number) => string;
  onOpenActivity: (id: string) => void;
}) {
  if (items.length === 0) {
    return <Text style={styles.empty}>No activity yet — start a goal to see moves here.</Text>;
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

export function GoalBasedBucketView({
  balance,
  ongoingGoals,
  finishedGoals,
  formatAmount,
  recentActivity,
  onStartCreate,
  onOpenGoal,
  onOpenActivity,
}: Props) {
  const [filter, setFilter] = useState<GoalsFilter>('ongoing');
  const theme = SavingsBucketTheme['goal-based'];

  return (
    <SavingsBucketScroll>
      <SavingsPlansRing
        plans={ongoingGoals}
        total={balance}
        formatAmount={formatAmount}
        onPlanPress={onOpenGoal}
        totalLabel="TOTAL SAVED"
        countLabel={(n) =>
          n === 0 ? 'No active goals' : `${n} active goal${n === 1 ? '' : 's'}`
        }
        fallbackAccent={theme.accent}
      />

      <CollapsibleTemplateSection title="Start a pot">
        <LiquidGlass style={styles.tableCard} intensity={44} contentStyle={styles.tableInner}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderLabel}>Goal</Text>
            <Text style={[styles.tableHeaderLabel, styles.tableHeaderRight]}>Target</Text>
            <View style={styles.tableHeaderAction} />
          </View>
          {GOAL_TEMPLATES.map((template) => (
            <View key={template.id} style={[styles.tableRow, styles.tableRowBorder]}>
              <Text style={[styles.tablePrimary, { color: theme.accent }]}>{template.title}</Text>
              <Text style={styles.tableSecondary}>{template.targetHint}</Text>
              <View style={styles.tableHeaderAction}>
                <TableActionButton
                  label="Start"
                  onPress={() => onStartCreate(template.id)}
                  accentColor={theme.accent}
                  accessibilityLabel={`Start ${template.title}`}
                />
              </View>
            </View>
          ))}
          <SavingsCustomTemplateRow
            bucket="goal-based"
            accentColor={theme.accent}
            actionLabel="Start"
            onPress={() => onStartCreate(CUSTOM_SAVINGS_TEMPLATE_ID)}
          />
        </LiquidGlass>
      </CollapsibleTemplateSection>

      <View style={styles.filterBlock}>
        <SegmentRail
          items={GOALS_FILTER}
          value={filter}
          onChange={setFilter}
          accentColor={theme.accent}
        />
        <LiquidGlass style={styles.listCard} intensity={44} contentStyle={styles.listInner}>
          {filter === 'ongoing' ? (
            ongoingGoals.length === 0 ? (
              <Text style={styles.empty}>No ongoing goals — pick one above to start.</Text>
            ) : (
              ongoingGoals.map((goal, i) => (
                <View key={goal.id} style={i < ongoingGoals.length - 1 ? styles.rowBorder : undefined}>
                  <GoalRow
                    goal={goal}
                    formatAmount={formatAmount}
                    onPress={() => onOpenGoal(goal.id)}
                  />
                </View>
              ))
            )
          ) : null}

          {filter === 'finished' ? (
            finishedGoals.length === 0 ? (
              <Text style={styles.empty}>No finished goals yet.</Text>
            ) : (
              finishedGoals.map((goal, i) => (
                <View key={goal.id} style={i < finishedGoals.length - 1 ? styles.rowBorder : undefined}>
                  <GoalRow
                    goal={goal}
                    formatAmount={formatAmount}
                    onPress={() => onOpenGoal(goal.id)}
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
