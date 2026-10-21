import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppScreen } from '@/components/app/AppScreen';
import { SettingsScreenShell, SettingsTopBar, SETTINGS_TITLE_GAP } from '@/components/settings/SettingsDetailScreen';
import { GlassPressable } from '@/components/ui/GlassPressable';
import { UdaraMarkIcon, UDARA_MARK_BUTTON_SIZE } from '@/components/icons/UdaraMarkIcon';
import { PoweredByPiggyvest } from '@/components/savings/PoweredByPiggyvest';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import {
  getAutoSavePlanById,
  autoSaveAskUdaraChatMessage,
  type AutoSavePlan,
} from '@/constants/AutoSavePlans';
import {
  getGoalPlanById,
  goalAskUdaraChatMessage,
  progressPct,
  remainingForGoal,
  type GoalPlan,
} from '@/constants/GoalPlans';
import type { SavingsBucketId } from '@/constants/MockData';
import {
  getSpendSaveRuleById,
  spendSaveAskUdaraChatMessage,
  type SpendSaveRule,
} from '@/constants/SpendSaveRules';
import {
  accruedInterestForPlan,
  getHardLockPlanById,
  tierForId,
  type HardLockPlan,
} from '@/constants/HardLockPlans';
import { SavingsBucketTheme } from '@/constants/SavingsTheme';
import { usePreferences } from '@/context/PreferencesContext';
import { openUdaraChat } from '@/helpers/openUdaraChat';

function DetailRow({
  label,
  value,
  last,
  accent,
}: {
  label: string;
  value: string;
  last?: boolean;
  accent?: string;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, accent ? { color: accent } : null]}>{value}</Text>
    </View>
  );
}

function PlanDetailLayout({
  title,
  goBack,
  insets,
  hero,
  rows,
  note,
  action,
}: {
  title: string;
  goBack: () => void;
  insets: { bottom: number };
  hero: ReactNode;
  rows: ReactNode;
  note: string;
  action?: ReactNode;
}) {
  return (
    <AppScreen>
      <View style={styles.page}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + (action ? 88 : 72) },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <SettingsTopBar
            title={title}
            onBack={goBack}
            style={styles.planTopBar}
          />
          <View style={styles.main}>
            {hero}
            <LiquidGlass style={styles.card} intensity={44} contentStyle={styles.cardInner}>
              {rows}
            </LiquidGlass>
            <Text style={styles.note}>{note}</Text>
            {action}
          </View>
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <PoweredByPiggyvest />
        </View>
      </View>
    </AppScreen>
  );
}

function HeroCard({
  plan,
  formatAmount,
  statusLabel,
  finished,
  accent,
}: {
  plan: { emoji: string; color: string; colorBg: string; title: string; amount: number };
  formatAmount: (n: number) => string;
  statusLabel: string;
  finished: boolean;
  accent: string;
}) {
  return (
    <View style={[styles.hero, { backgroundColor: plan.colorBg, borderColor: `${plan.color}33` }]}>
      <View style={[styles.heroIcon, { backgroundColor: `${plan.color}18` }]}>
        <Text style={styles.heroEmoji}>{plan.emoji}</Text>
      </View>
      <Text style={styles.heroTitle}>{plan.title}</Text>
      <Text style={styles.heroAmount}>{formatAmount(plan.amount)}</Text>
      <View
        style={[
          styles.statusPill,
          finished ? styles.statusFinished : null,
          !finished ? { backgroundColor: `${accent}1F` } : null,
        ]}>
        <Text
          style={[
            styles.statusText,
            finished ? styles.statusTextFinished : null,
            !finished ? { color: accent } : null,
          ]}>
          {statusLabel}
        </Text>
      </View>
    </View>
  );
}

function AskUdaraButton({
  subject,
  message,
}: {
  subject: string;
  accent: string;
  message: string;
}) {
  const router = useRouter();

  return (
    <GlassPressable
      onPress={() => openUdaraChat(router, message)}
      size="md"
      fullWidth
      style={{ marginTop: 4 }}
      accessibilityLabel={`Ask Udara about ${subject}`}>
      <UdaraMarkIcon size={UDARA_MARK_BUTTON_SIZE} color="#fff" />
      <Text style={styles.askBtnText}>Ask Udara</Text>
    </GlassPressable>
  );
}

function HardLockDetail({
  plan,
  formatAmount,
  goBack,
  insets,
}: {
  plan: HardLockPlan;
  formatAmount: (n: number) => string;
  goBack: () => void;
  insets: { bottom: number };
}) {
  const theme = SavingsBucketTheme.hardlock;
  const tier = tierForId(plan.tierId);
  const finished = plan.status === 'finished';
  const interestEarned = accruedInterestForPlan(plan);

  return (
    <PlanDetailLayout
      title="HardLock plan"
      goBack={goBack}
      insets={insets}
      hero={
        <HeroCard
          plan={plan}
          formatAmount={formatAmount}
          statusLabel={finished ? 'Finished' : 'Ongoing'}
          finished={finished}
          accent={theme.accent}
        />
      }
      rows={
        <>
          <DetailRow label="Interest rate" value={plan.rateLabel} accent={theme.accent} />
          <DetailRow label="Duration" value={tier.durationLabel} />
          <DetailRow label="Unlock" value={plan.unlockLabel} />
          <DetailRow
            label="Interest earned"
            value={`+${formatAmount(interestEarned)}`}
            accent={theme.accent}
            last
          />
        </>
      }
      note={
        finished
          ? 'This lock completed and funds were returned to your HardLock balance with interest.'
          : 'Funds stay locked until the unlock date. Early withdrawal is not available on this plan.'
      }
    />
  );
}

function GoalDetail({
  goal,
  formatAmount,
  goBack,
  insets,
}: {
  goal: GoalPlan;
  formatAmount: (n: number) => string;
  goBack: () => void;
  insets: { bottom: number };
}) {
  const theme = SavingsBucketTheme['goal-based'];
  const finished = goal.status === 'finished';
  const pct = progressPct(goal);
  const remaining = remainingForGoal(goal);

  return (
    <PlanDetailLayout
      title="Savings goal"
      goBack={goBack}
      insets={insets}
      hero={
        <HeroCard
          plan={goal}
          formatAmount={formatAmount}
          statusLabel={finished ? 'Finished' : 'Ongoing'}
          finished={finished}
          accent={theme.accent}
        />
      }
      rows={
        <>
          <DetailRow label="Progress" value={`${pct}%`} accent={theme.accent} />
          <DetailRow label="Target" value={formatAmount(goal.targetAmount)} />
          <DetailRow label="Due date" value={goal.dueLabel.replace(/^Due /, '').replace(/^Completed · /, '')} />
          <DetailRow
            label="Remaining"
            value={formatAmount(remaining)}
            accent={theme.accent}
            last
          />
        </>
      }
      note={
        finished
          ? 'You hit this goal — funds are ready to use or move to another bucket.'
          : 'Top up, change your target, or break this goal anytime through Udara.'
      }
      action={
        <AskUdaraButton
          subject={goal.title}
          accent={theme.accent}
          message={goalAskUdaraChatMessage(goal)}
        />
      }
    />
  );
}

function SpendSaveDetail({
  rule,
  formatAmount,
  goBack,
  insets,
}: {
  rule: SpendSaveRule;
  formatAmount: (n: number) => string;
  goBack: () => void;
  insets: { bottom: number };
}) {
  const theme = SavingsBucketTheme['spend-save'];
  const paused = rule.status === 'paused';

  return (
    <PlanDetailLayout
      title="Spend & Save rule"
      goBack={goBack}
      insets={insets}
      hero={
        <HeroCard
          plan={rule}
          formatAmount={formatAmount}
          statusLabel={paused ? 'Paused' : 'Active'}
          finished={paused}
          accent={theme.accent}
        />
      }
      rows={
        <>
          <DetailRow label="Status" value={paused ? 'Paused' : 'Active'} accent={theme.accent} />
          <DetailRow label="Period" value={rule.meta} />
          <DetailRow label="Saved" value={formatAmount(rule.amount)} accent={theme.accent} last />
        </>
      }
      note="Pause, change the rate, or turn off this rule anytime through Udara."
      action={
        <AskUdaraButton
          subject={rule.title}
          accent={theme.accent}
          message={spendSaveAskUdaraChatMessage(rule)}
        />
      }
    />
  );
}

function AutoSaveDetail({
  plan,
  formatAmount,
  goBack,
  insets,
}: {
  plan: AutoSavePlan;
  formatAmount: (n: number) => string;
  goBack: () => void;
  insets: { bottom: number };
}) {
  const theme = SavingsBucketTheme['auto-save'];

  return (
    <PlanDetailLayout
      title="Auto Save plan"
      goBack={goBack}
      insets={insets}
      hero={
        <HeroCard
          plan={plan}
          formatAmount={formatAmount}
          statusLabel={plan.statusLabel}
          finished={plan.pending}
          accent={theme.accent}
        />
      }
      rows={
        <>
          <DetailRow label="Schedule" value={plan.scheduleLabel} accent={theme.accent} />
          <DetailRow label="Saved" value={formatAmount(plan.amount)} />
          <DetailRow label="Status" value={plan.statusLabel} accent={theme.accent} last />
        </>
      }
      note="Change the amount, pause, or cancel this plan anytime through Udara."
      action={
        <AskUdaraButton
          subject={plan.title}
          accent={theme.accent}
          message={autoSaveAskUdaraChatMessage(plan)}
        />
      }
    />
  );
}

export default function SavingsPlanDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { formatAmount } = usePreferences();
  const { bucket: raw, planId } = useLocalSearchParams<{ bucket: string; planId: string }>();
  const bucket = (raw ?? 'hardlock') as SavingsBucketId;

  const hardLockPlan = useMemo(
    () => (bucket === 'hardlock' && planId ? getHardLockPlanById(planId) : undefined),
    [bucket, planId],
  );
  const goalPlan = useMemo(
    () => (bucket === 'goal-based' && planId ? getGoalPlanById(planId) : undefined),
    [bucket, planId],
  );
  const spendRule = useMemo(
    () => (bucket === 'spend-save' && planId ? getSpendSaveRuleById(planId) : undefined),
    [bucket, planId],
  );
  const autoPlan = useMemo(
    () => (bucket === 'auto-save' && planId ? getAutoSavePlanById(planId) : undefined),
    [bucket, planId],
  );

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/(app)/savings/${bucket}`);
  };

  if (bucket === 'goal-based' && goalPlan) {
    return (
      <GoalDetail goal={goalPlan} formatAmount={formatAmount} goBack={goBack} insets={insets} />
    );
  }

  if (bucket === 'spend-save' && spendRule) {
    return (
      <SpendSaveDetail
        rule={spendRule}
        formatAmount={formatAmount}
        goBack={goBack}
        insets={insets}
      />
    );
  }

  if (bucket === 'auto-save' && autoPlan) {
    return (
      <AutoSaveDetail
        plan={autoPlan}
        formatAmount={formatAmount}
        goBack={goBack}
        insets={insets}
      />
    );
  }

  if (bucket === 'hardlock' && hardLockPlan) {
    return (
      <HardLockDetail
        plan={hardLockPlan}
        formatAmount={formatAmount}
        goBack={goBack}
        insets={insets}
      />
    );
  }

  const missingTitle =
    bucket === 'goal-based'
      ? 'Savings goal'
      : bucket === 'spend-save'
        ? 'Spend & Save rule'
        : bucket === 'auto-save'
          ? 'Auto Save plan'
          : 'HardLock plan';
  const missingSubject =
    bucket === 'goal-based'
      ? 'goal'
      : bucket === 'spend-save'
        ? 'rule'
        : bucket === 'auto-save'
          ? 'plan'
          : 'plan';

  return (
    <SettingsScreenShell title={missingTitle} onBack={goBack}>
      <View style={styles.missingWrap}>
        <Text style={styles.missingText}>This {missingSubject} could not be found.</Text>
      </View>
    </SettingsScreenShell>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: AppTheme.edgePadH,
    paddingTop: 0,
    paddingBottom: 32,
  },
  planTopBar: {
    marginTop: 0,
    marginBottom: SETTINGS_TITLE_GAP + 12,
  },
  main: {
    gap: 18,
    paddingTop: 8,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: 12,
  },
  missingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  missingText: {
    color: AppTheme.textMuted,
    fontSize: 15,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
  },
  hero: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 8,
  },
  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroEmoji: {
    fontSize: 32,
  },
  heroTitle: {
    color: AppTheme.text,
    fontSize: 21,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  heroAmount: {
    color: AppTheme.text,
    fontSize: 34,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.8,
  },
  statusPill: {
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusFinished: {
    backgroundColor: 'rgba(13,13,13,0.06)',
  },
  statusText: {
    fontSize: 12,
    fontFamily: FontFamily.semibold,
  },
  statusTextFinished: {
    color: AppTheme.textMuted,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppTheme.border,
  },
  cardInner: {
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 15,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppTheme.border,
  },
  rowLabel: {
    color: AppTheme.textMuted,
    fontSize: 14,
    fontFamily: FontFamily.regular,
  },
  rowValue: {
    flexShrink: 1,
    color: AppTheme.text,
    fontSize: 14,
    fontFamily: FontFamily.semibold,
    textAlign: 'right',
  },
  note: {
    color: AppTheme.textMuted,
    fontSize: 14,
    fontFamily: FontFamily.regular,
    lineHeight: 20,
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  askBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FontFamily.semibold,
  },
});
