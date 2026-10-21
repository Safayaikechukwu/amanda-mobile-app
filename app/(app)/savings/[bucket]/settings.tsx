import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import {
  SettingsActionRow,
  SettingsRowDivider,
  SettingsScreenShell,
  SettingsToggleRow,
  SETTINGS_HERO,
} from '@/components/settings/SettingsDetailScreen';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { MockSavingsBuckets } from '@/constants/MockData';
import { usePreferences } from '@/context/PreferencesContext';

export default function BucketSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { formatAmount } = usePreferences();
  const { bucket: raw } = useLocalSearchParams<{ bucket: string }>();
  const bucket = useMemo(
    () => MockSavingsBuckets.find((b) => b.id === raw) ?? MockSavingsBuckets[1],
    [raw],
  );

  const [weeklyEnabled, setWeeklyEnabled] = useState(true);
  const [paydayEnabled, setPaydayEnabled] = useState(true);
  const [roundUpEnabled, setRoundUpEnabled] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/(app)/savings/${bucket.id}`);
  };

  return (
    <SettingsScreenShell
      title="Settings"
      onBack={goBack}
      contentStyle={{ paddingBottom: insets.bottom + 24 }}>
      <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="flash-outline" size={22} color={AppTheme.accent} />
          </View>
          <Text style={styles.heroTitle}>Auto Save rules</Text>
          <Text style={styles.heroDescription}>
            Manage the schedules that move money into Auto Save automatically.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Active plans</Text>
        <LiquidGlass style={styles.cardShell} intensity={42} contentStyle={styles.card}>
          <SettingsToggleRow
            icon="calendar-outline"
            title="Weekly ₦10k"
            subtitle="Every Friday · next debit tomorrow"
            value={weeklyEnabled}
            onValueChange={setWeeklyEnabled}
          />
          <SettingsRowDivider />
          <SettingsToggleRow
            icon="cash-outline"
            title="Payday 10%"
            subtitle="Monthly · 10% of incoming salary"
            value={paydayEnabled}
            onValueChange={setPaydayEnabled}
          />
          <SettingsRowDivider />
          <SettingsToggleRow
            icon="pulse-outline"
            title="Round-up spare change"
            subtitle="Save the difference on incoming transfers"
            value={roundUpEnabled}
            onValueChange={setRoundUpEnabled}
          />
        </LiquidGlass>

        <Text style={[styles.sectionLabel, styles.sectionGap]}>Limits</Text>
        <LiquidGlass style={styles.cardShell} intensity={42} contentStyle={styles.card}>
          <SettingsActionRow
            icon="arrow-down-outline"
            title="Daily withdrawal limit"
            subtitle={formatAmount(100000)}
          />
          <SettingsRowDivider />
          <SettingsActionRow
            icon="shield-checkmark-outline"
            title="PIN for withdrawals"
            subtitle="Required before money leaves Auto Save"
          />
        </LiquidGlass>
    </SettingsScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    ...SETTINGS_HERO,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(74,5,8,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: AppTheme.text,
    fontSize: 22,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  heroDescription: {
    color: AppTheme.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    maxWidth: 300,
  },
  sectionLabel: {
    color: AppTheme.textFaint,
    fontSize: 11,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 2,
  },
  sectionGap: {
    marginTop: 22,
  },
  cardShell: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppTheme.border,
  },
  card: {
    paddingVertical: 2,
    paddingHorizontal: 14,
  },
});
