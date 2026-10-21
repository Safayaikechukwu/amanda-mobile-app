import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ScreenLargeHeader } from '@/components/app/ScreenLargeHeader';
import { MoneyMovementRow } from '@/components/ui/MoneyMovementRow';
import { BackIconButton } from '@/components/ui/BackIconButton';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { listAllSavingsActivities } from '@/constants/SavingsActivity';
import { SavingsBucketTheme } from '@/constants/SavingsTheme';
import { resolveSavingsStatus } from '@/constants/TransactionStatus';
import { usePreferences } from '@/context/PreferencesContext';
import {
  activityRowSubtitle,
  groupSavingsActivitiesByPeriod,
} from '@/helpers/groupSavingsActivity';

export default function SavingsActivityListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { formatAmount } = usePreferences();

  const groups = useMemo(
    () => groupSavingsActivitiesByPeriod(listAllSavingsActivities()),
    [],
  );

  const openActivity = (activityId: string) => {
    router.push(`/(app)/savings/activity/${activityId}`);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 32) }]}
        showsVerticalScrollIndicator={false}>
        <ScreenLargeHeader
          leading={<BackIconButton onPress={() => router.back()} accessibilityLabel="Back" />}
          title="Recent saves"
          subtitle={`${groups.reduce((n, g) => n + g.items.length, 0)} movements`}
        />

        <View style={styles.sections}>
          {groups.map((group) => (
            <View key={group.key} style={styles.section}>
              <Text style={styles.sectionLabel}>{group.label}</Text>
              <LiquidGlass style={styles.listCard} intensity={44} contentStyle={styles.listInner}>
                {group.items.map((item, i) => {
                  const status = resolveSavingsStatus(item);
                  const bucketTheme = SavingsBucketTheme[item.bucketId];
                  return (
                    <View
                      key={item.id}
                      style={[styles.rowWrap, i < group.items.length - 1 && styles.rowBorder]}>
                      <MoneyMovementRow
                        title={item.label}
                        subtitle={activityRowSubtitle(item, status)}
                        amount={item.amount}
                        status={status}
                        direction={item.direction ?? 'in'}
                        avatarLetter={item.category}
                        avatarBg={bucketTheme.iconBg}
                        avatarTextColor={bucketTheme.accent}
                        formatAmount={formatAmount}
                        onPress={() => openActivity(item.id)}
                      />
                    </View>
                  );
                })}
              </LiquidGlass>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppTheme.bg },
  content: {
    paddingTop: 4,
  },
  sections: {
    paddingHorizontal: AppTheme.edgePadH,
    gap: 22,
    paddingTop: 6,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    color: AppTheme.textFaint,
    fontSize: 11,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginLeft: 2,
  },
  listCard: {
    borderRadius: 14,
    boxShadow: '0 8px 24px rgba(13,13,13,0.05)',
    elevation: 2,
  },
  listInner: {
    paddingVertical: 2,
    paddingHorizontal: 14,
  },
  rowWrap: {
    paddingHorizontal: 2,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60,60,67,0.1)',
  },
});
