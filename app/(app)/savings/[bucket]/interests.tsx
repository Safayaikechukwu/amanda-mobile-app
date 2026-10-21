import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsScreenShell } from '@/components/settings/SettingsDetailScreen';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { MockSavingsBuckets } from '@/constants/MockData';
import { SavingsBucketTheme } from '@/constants/SavingsTheme';
import { usePreferences } from '@/context/PreferencesContext';

const INTEREST_HISTORY = [
  { id: 'i1', label: 'August payout', amount: 980, when: '1 Aug 2026' },
  { id: 'i2', label: 'July payout', amount: 920, when: '1 Jul 2026' },
  { id: 'i3', label: 'June payout', amount: 860, when: '1 Jun 2026' },
];

export default function BucketInterestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { formatAmount } = usePreferences();
  const { bucket: raw } = useLocalSearchParams<{ bucket: string }>();
  const bucket = useMemo(
    () => MockSavingsBuckets.find((b) => b.id === raw) ?? MockSavingsBuckets[1],
    [raw],
  );
  const theme = SavingsBucketTheme[bucket.id];

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/(app)/savings/${bucket.id}`);
  };

  const totalEarned = INTEREST_HISTORY.reduce((sum, row) => sum + row.amount, 0);

  return (
    <SettingsScreenShell
      title="Interests"
      onBack={goBack}
      contentStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
      <View style={[styles.hero, { backgroundColor: theme.surface, borderColor: `${theme.accent}22` }]}>
          <Text style={styles.heroLabel}>Total earned</Text>
          <Text style={[styles.heroValue, { color: theme.accent }]}>{formatAmount(totalEarned)}</Text>
          <Text style={styles.heroMeta}>10% per annum · paid monthly</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>This month</Text>
            <Text style={styles.statValue}>{formatAmount(980)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Avg balance</Text>
            <Text style={styles.statValue}>{formatAmount(bucket.amount)}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Payout history</Text>
        <LiquidGlass style={styles.listCard} intensity={44} contentStyle={styles.listInner}>
          {INTEREST_HISTORY.map((row, i) => (
            <View key={row.id} style={[styles.row, i < INTEREST_HISTORY.length - 1 && styles.rowBorder]}>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>{row.label}</Text>
                <Text style={styles.rowSub}>{row.when}</Text>
              </View>
              <Text style={[styles.rowAmount, { color: theme.accent }]}>+{formatAmount(row.amount)}</Text>
            </View>
          ))}
        </LiquidGlass>
    </SettingsScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  hero: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 4,
  },
  heroLabel: {
    color: AppTheme.textMuted,
    fontSize: 12,
    fontFamily: FontFamily.medium,
  },
  heroValue: {
    fontSize: 34,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.8,
  },
  heroMeta: {
    color: AppTheme.textFaint,
    fontSize: 12,
    fontFamily: FontFamily.regular,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppTheme.border,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  statLabel: {
    color: AppTheme.textFaint,
    fontSize: 11,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  statValue: {
    color: AppTheme.text,
    fontSize: 17,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.3,
  },
  sectionLabel: {
    color: AppTheme.textFaint,
    fontSize: 11,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  listCard: { borderRadius: 14 },
  listInner: { paddingHorizontal: 14, paddingVertical: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppTheme.border,
  },
  rowCopy: { flex: 1, gap: 2 },
  rowTitle: {
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.semibold,
  },
  rowSub: {
    color: AppTheme.textFaint,
    fontSize: 12,
    fontFamily: FontFamily.regular,
  },
  rowAmount: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
  },
});
