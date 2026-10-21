import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SpendingLimitsCard } from '@/components/discipline/SpendingLimitsCard';
import { SpendingWindowCard } from '@/components/discipline/SpendingWindowCard';
import {
  SettingsHeroBlock,
  SettingsScreenShell,
} from '@/components/settings/SettingsDetailScreen';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Text } from '@/components/ui/Text';
import { MockSpendingLimits } from '@/constants/MoneyControls';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { useMoneyControls } from '@/context/MoneyControlsContext';
import { usePreferences } from '@/context/PreferencesContext';
import { hapticLight, hapticSuccess, hapticWarning } from '@/helpers/haptics';
import { buildSpendingWindowChatMessage } from '@/helpers/spendingWindowChat';
import {
  changeWillIncurFine,
  changesRemaining,
  formatWindowRange,
  SPENDING_WINDOW_CHANGE_LIMITS,
} from '@/helpers/spendingWindow';
import { openUdaraChat } from '@/helpers/openUdaraChat';

function openChat(router: ReturnType<typeof useRouter>, message: string) {
  openUdaraChat(router, message, { focusComposer: true });
}

type PendingWindow = {
  startMinutes: number;
  endMinutes: number;
};

export default function DisciplineScreen() {
  const router = useRouter();
  const { formatAmount } = usePreferences();
  const {
    spendingWindow,
    stats,
    applySpendingWindow,
    recordSpendingWindowChange,
  } = useMoneyControls();

  const { startMinutes, endMinutes } = spendingWindow;
  const { brokenThisMonth, changesUsedThisMonth, changesUsedThisWeek } = stats;

  const [pendingWindow, setPendingWindow] = useState<PendingWindow | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const monthRemaining = changesRemaining(changesUsedThisMonth, SPENDING_WINDOW_CHANGE_LIMITS.perMonth);
  const weekRemaining = changesRemaining(changesUsedThisWeek, SPENDING_WINDOW_CHANGE_LIMITS.perWeek);

  const limitsSummary = `${formatAmount(MockSpendingLimits.daily)} daily · ${formatAmount(MockSpendingLimits.weekly)} weekly · ${formatAmount(MockSpendingLimits.monthly)} monthly`;

  const onRequestConfirm = useCallback((nextStart: number, nextEnd: number) => {
    setPendingWindow({ startMinutes: nextStart, endMinutes: nextEnd });
    setConfirmOpen(true);
    hapticLight();
  }, []);

  const cancelConfirm = () => {
    setConfirmOpen(false);
    setPendingWindow(null);
    hapticLight();
  };

  const applyWindowChange = () => {
    if (!pendingWindow) return;
    const incurFine = changeWillIncurFine(monthRemaining, weekRemaining);
    const { startMinutes: nextStart, endMinutes: nextEnd } = pendingWindow;

    void applySpendingWindow(nextStart, nextEnd);
    void recordSpendingWindowChange();

    setConfirmOpen(false);
    setPendingWindow(null);

    if (incurFine) hapticWarning();
    else hapticSuccess();

    openChat(router, buildSpendingWindowChatMessage(nextStart, nextEnd));
  };

  const confirmTitle = pendingWindow ? 'Are you sure?' : 'Confirm';

  const confirmMessage = (() => {
    if (!pendingWindow) return undefined;
    const range = formatWindowRange(pendingWindow.startMinutes, pendingWindow.endMinutes);
    const incurFine = changeWillIncurFine(monthRemaining, weekRemaining);
    if (incurFine) {
      return `Set your window to ${range}? You’ve used your free changes — this adds a ₦${SPENDING_WINDOW_CHANGE_LIMITS.fineNgn.toLocaleString('en-NG')} fine.`;
    }
    return `Set your window to ${range}? You’ll have ${monthRemaining - 1} change${monthRemaining - 1 === 1 ? '' : 's'} left this month and ${weekRemaining - 1} this week.`;
  })();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/profile');
  };

  return (
    <>
      <SettingsScreenShell title="Discipline" onBack={goBack} contentStyle={styles.scroll}>
        <SettingsHeroBlock
          icon="shield-outline"
          title="Stay in control."
          description="How much you can spend and when spending is allowed each day."
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Limits</Text>
          <SpendingLimitsCard
            summary={limitsSummary}
            onChangePress={() => openChat(router, 'I want to change my spending limits')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Window</Text>
          <SpendingWindowCard
            startMinutes={startMinutes}
            endMinutes={endMinutes}
            onRequestConfirm={onRequestConfirm}
          />
          <Text style={styles.sectionFootnote}>
            Broken {brokenThisMonth}× this month · {monthRemaining} change
            {monthRemaining === 1 ? '' : 's'} left · {weekRemaining} this week
          </Text>
        </View>
      </SettingsScreenShell>

      <ConfirmDialog
        visible={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        cancelLabel="Not now"
        confirmLabel="Yes, I’m sure"
        destructive={changeWillIncurFine(monthRemaining, weekRemaining)}
        onCancel={cancelConfirm}
        onConfirm={applyWindowChange}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 4,
  },
  section: {
    gap: 8,
    marginBottom: 20,
  },
  sectionLabel: {
    color: AppTheme.textFaint,
    fontSize: 11,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginLeft: 2,
  },
  sectionFootnote: {
    color: AppTheme.textFaint,
    fontSize: 12,
    fontFamily: FontFamily.regular,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 4,
  },
});
