import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AutoSaveBucketView } from '@/components/savings/AutoSaveBucketView';
import { GoalBasedBucketView } from '@/components/savings/GoalBasedBucketView';
import { QuickSaveSheet } from '@/components/savings/QuickSaveSheet';
import { HardLockBucketView } from '@/components/savings/HardLockBucketView';
import { SpendSaveBucketView } from '@/components/savings/SpendSaveBucketView';
import { BackIconButton } from '@/components/ui/BackIconButton';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import {
  MOCK_GOAL_FINISHED,
  MOCK_GOAL_ONGOING,
  goalCreateChatMessage,
  setLiveGoalPlans,
} from '@/constants/GoalPlans';
import {
  MockSavingsBuckets,
  type SavingsBucketId,
} from '@/constants/MockData';
import {
  autoSavePlansFromItems,
  autoSaveCreateChatMessage,
  setLiveAutoSavePlans,
} from '@/constants/AutoSavePlans';
import {
  MOCK_SPEND_SAVE_ACTIVE,
  setLiveSpendSaveRules,
  spendSaveCreateChatMessage,
} from '@/constants/SpendSaveRules';
import {
  MOCK_HARDLOCK_FINISHED,
  MOCK_HARDLOCK_ONGOING,
  hardlockCreateChatMessage,
  setLiveHardLockPlans,
} from '@/constants/HardLockPlans';
import {
  listActivitiesForBucket,
  patchBucketItems,
} from '@/constants/SavingsActivity';
import { usePreferences } from '@/context/PreferencesContext';
import { openUdaraChat } from '@/helpers/openUdaraChat';

const VALID = new Set<SavingsBucketId>([
  'spend-save',
  'auto-save',
  'hardlock',
  'goal-based',
]);

export default function SavingsBucketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { formatAmount } = usePreferences();
  const { bucket: raw } = useLocalSearchParams<{ bucket: string }>();
  const id = (VALID.has(raw as SavingsBucketId) ? raw : 'spend-save') as SavingsBucketId;

  const seed = useMemo(
    () => MockSavingsBuckets.find((b) => b.id === id) ?? MockSavingsBuckets[0],
    [id],
  );
  const isAutoSave = id === 'auto-save';
  const isHardLock = id === 'hardlock';
  const isGoalBased = id === 'goal-based';
  const isSpendSave = id === 'spend-save';

  const [amount, setAmount] = useState(seed.amount);
  const [items, setItems] = useState(seed.items);
  const [quickOpen, setQuickOpen] = useState(false);
  const [ongoingPlans, setOngoingPlans] = useState(MOCK_HARDLOCK_ONGOING);
  const [finishedPlans] = useState(MOCK_HARDLOCK_FINISHED);
  const [ongoingGoals, setOngoingGoals] = useState(MOCK_GOAL_ONGOING);
  const [finishedGoals] = useState(MOCK_GOAL_FINISHED);
  const [activeRules] = useState(MOCK_SPEND_SAVE_ACTIVE);

  const recentActivity = useMemo(() => listActivitiesForBucket(id), [id, items, amount]);

  useEffect(() => {
    patchBucketItems(id, items);
  }, [id, items]);

  useEffect(() => {
    if (!isHardLock) return;
    setLiveHardLockPlans(ongoingPlans, finishedPlans);
  }, [isHardLock, ongoingPlans, finishedPlans]);

  useEffect(() => {
    if (!isGoalBased) return;
    setLiveGoalPlans(ongoingGoals, finishedGoals);
  }, [isGoalBased, ongoingGoals, finishedGoals]);

  useEffect(() => {
    if (!isSpendSave) return;
    setLiveSpendSaveRules(activeRules);
  }, [isSpendSave, activeRules]);

  useEffect(() => {
    if (!isAutoSave) return;
    setLiveAutoSavePlans(autoSavePlansFromItems(items));
  }, [isAutoSave, items]);

  const openActivity = (activityId: string) => {
    router.push(`/(app)/savings/activity/${activityId}`);
  };

  const openPlan = (planId: string) => {
    router.push(`/(app)/savings/${id}/plan/${planId}`);
  };

  const onSave = ({ amount: value }: { amount: number; bucketId: SavingsBucketId }) => {
    if (value <= 0) return;
    setAmount((a) => a + value);
    setItems((prev) => [
      {
        id: `n-${Date.now()}`,
        label: 'Quick Save',
        amount: value,
        meta: 'Just now',
        occurredAt: new Date().toISOString(),
        status: 'successful',
        direction: 'in',
      },
      ...prev,
    ]);
    setQuickOpen(false);
  };

  const openChat = (message: string) => {
    openUdaraChat(router, message);
  };

  const openCreate = (templateId?: string) => {
    const message = isGoalBased
      ? goalCreateChatMessage(templateId)
      : isSpendSave
        ? spendSaveCreateChatMessage(templateId)
        : isAutoSave
          ? autoSaveCreateChatMessage(templateId)
          : hardlockCreateChatMessage(templateId);

    openChat(message);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <StatusBar style="dark" />
      <View style={styles.nav}>
        <BackIconButton onPress={() => router.back()} accessibilityLabel="Back" />
        <Text style={styles.navTitle} numberOfLines={1}>
          {seed.title}
        </Text>
        <View style={styles.navSide} />
      </View>

      {isHardLock ? (
        <HardLockBucketView
          balance={amount}
          ongoingPlans={ongoingPlans}
          finishedPlans={finishedPlans}
          formatAmount={formatAmount}
          recentActivity={recentActivity}
          onStartCreate={openCreate}
          onOpenPlan={openPlan}
          onOpenActivity={openActivity}
        />
      ) : isAutoSave ? (
        <AutoSaveBucketView
          balance={amount}
          plans={items}
          formatAmount={formatAmount}
          recentActivity={recentActivity}
          onQuickSave={() => setQuickOpen(true)}
          onStartCreate={openCreate}
          onOpenPlan={openPlan}
          onOpenActivity={openActivity}
        />
      ) : isGoalBased ? (
        <GoalBasedBucketView
          balance={amount}
          ongoingGoals={ongoingGoals}
          finishedGoals={finishedGoals}
          formatAmount={formatAmount}
          recentActivity={recentActivity}
          onStartCreate={openCreate}
          onOpenGoal={openPlan}
          onOpenActivity={openActivity}
        />
      ) : (
        <SpendSaveBucketView
          balance={amount}
          activeRules={activeRules}
          formatAmount={formatAmount}
          recentActivity={recentActivity}
          onQuickSave={() => setQuickOpen(true)}
          onStartCreate={openCreate}
          onOpenRule={openPlan}
          onOpenActivity={openActivity}
        />
      )}

      <QuickSaveSheet
        visible={quickOpen}
        bucketId={id}
        onClose={() => setQuickOpen(false)}
        onSave={onSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppTheme.bg },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 14,
    minHeight: 48,
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    color: AppTheme.text,
    fontSize: 17,
    fontFamily: FontFamily.semibold,
  },
  navSide: {
    width: 52,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
