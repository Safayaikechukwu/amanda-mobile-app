import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { SegmentRail } from '@/components/insights/SegmentRail';
import { bucketStyles as styles } from '@/components/savings/bucketStyles';
import { SavingsBucketScroll } from '@/components/savings/SavingsBucketScroll';
import { SavingsPlansRing } from '@/components/savings/SavingsPlansRing';
import { SavingsStartRecommendations } from '@/components/savings/SavingsStartRecommendations';
import {
  onCustomCreate,
  useSpendSaveRecommendations,
} from '@/components/savings/useSavingsRecommendations';
import { GlassPressable } from '@/components/ui/GlassPressable';
import { MoneyMovementRow } from '@/components/ui/MoneyMovementRow';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import type { SpendSaveRule } from '@/constants/SpendSaveRules';
import { SavingsBucketTheme } from '@/constants/SavingsTheme';
import type { SavingsMovementRecord } from '@/constants/SavingsActivity';
import {
  movementSubtitle,
  resolveSavingsStatus,
} from '@/constants/TransactionStatus';
import { activityRowSubtitle } from '@/helpers/groupSavingsActivity';

type Filter = 'active' | 'activity';

const FILTER = [
  { key: 'active' as const, label: 'Active rules' },
  { key: 'activity' as const, label: 'Activity' },
];

type Props = {
  balance: number;
  activeRules: SpendSaveRule[];
  formatAmount: (amount: number) => string;
  recentActivity: SavingsMovementRecord[];
  onQuickSave: () => void;
  onStartCreate: (templateId?: string) => void;
  onOpenRule: (ruleId: string) => void;
  onOpenActivity: (activityId: string) => void;
};

function RuleRow({
  rule,
  formatAmount,
  onPress,
}: {
  rule: SpendSaveRule;
  formatAmount: (n: number) => string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.planRow, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={rule.title}>
      <View style={[styles.planIcon, { backgroundColor: rule.colorBg }]}>
        <Text style={styles.planEmoji}>{rule.emoji}</Text>
      </View>
      <View style={styles.planCopy}>
        <Text style={styles.planTitle}>{rule.title}</Text>
        <Text style={styles.planMeta}>{rule.meta}</Text>
      </View>
      <Text style={styles.planAmount}>{formatAmount(rule.amount)}</Text>
    </Pressable>
  );
}

export function SpendSaveBucketView({
  balance,
  activeRules,
  formatAmount,
  recentActivity,
  onQuickSave,
  onStartCreate,
  onOpenRule,
  onOpenActivity,
}: Props) {
  const [filter, setFilter] = useState<Filter>('active');
  const theme = SavingsBucketTheme['spend-save'];
  const recommendations = useSpendSaveRecommendations(onStartCreate);

  return (
    <SavingsBucketScroll>
      <SavingsPlansRing
        plans={activeRules}
        total={balance}
        formatAmount={formatAmount}
        totalLabel="TOTAL SAVED"
        countLabel={(n) =>
          n === 0 ? 'No active rules' : `${n} active rule${n === 1 ? '' : 's'}`
        }
        fallbackAccent={theme.accent}
        onPlanPress={onOpenRule}
      />

      <SavingsStartRecommendations
        title="Add a rule"
        leftColumn="Rule"
        rightColumn="Type"
        rows={recommendations}
        bucket="spend-save"
        accentColor={theme.accent}
        customActionLabel="Add"
        onCustomPress={onCustomCreate(onStartCreate)}
      />

      <GlassPressable
        label="Quick Save"
        onPress={onQuickSave}
        accessibilityLabel="Quick Save"
      />

      <View style={styles.filterBlock}>
        <SegmentRail
          items={FILTER}
          value={filter}
          onChange={setFilter}
          accentColor={theme.accent}
        />
        <LiquidGlass style={styles.listCard} intensity={44} contentStyle={styles.listInner}>
          {filter === 'active' ? (
            activeRules.length === 0 ? (
              <Text style={styles.empty}>No active rules — add one above to start.</Text>
            ) : (
              activeRules.map((rule, i) => (
                <View key={rule.id} style={i < activeRules.length - 1 ? styles.rowBorder : undefined}>
                  <RuleRow
                    rule={rule}
                    formatAmount={formatAmount}
                    onPress={() => onOpenRule(rule.id)}
                  />
                </View>
              ))
            )
          ) : null}

          {filter === 'activity' ? (
            recentActivity.length === 0 ? (
              <Text style={styles.empty}>No activity yet — your next round-up will show here.</Text>
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
