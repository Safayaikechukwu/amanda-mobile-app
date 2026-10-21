import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { GlassPressable } from '@/components/ui/GlassPressable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsScreenShell } from '@/components/settings/SettingsDetailScreen';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { MockSavingsBuckets } from '@/constants/MockData';
import { usePreferences } from '@/context/PreferencesContext';

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000];

export default function BucketWithdrawScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { formatAmount } = usePreferences();
  const { bucket: raw } = useLocalSearchParams<{ bucket: string }>();
  const bucket = useMemo(
    () => MockSavingsBuckets.find((b) => b.id === raw) ?? MockSavingsBuckets[1],
    [raw],
  );
  const [amount, setAmount] = useState(10000);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/(app)/savings/${bucket.id}`);
  };

  return (
    <SettingsScreenShell
      title="Withdraw"
      onBack={goBack}
      contentStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.lead}>
          Move money from {bucket.title} back to your main account.
        </Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available</Text>
          <Text style={styles.balanceValue}>{formatAmount(bucket.amount)}</Text>
        </View>

        <Text style={styles.fieldLabel}>Amount</Text>
        <View style={styles.chips}>
          {QUICK_AMOUNTS.map((value) => {
            const active = amount === value;
            return (
              <Pressable
                key={value}
                onPress={() => setAmount(value)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {formatAmount(value)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <GlassPressable
          label={`Withdraw ${formatAmount(amount)}`}
          onPress={goBack}
          accessibilityLabel="Confirm withdrawal"
        />

        <Text style={styles.note}>Withdrawals usually arrive in your main account within minutes.</Text>
    </SettingsScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  lead: {
    color: AppTheme.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FontFamily.regular,
  },
  balanceCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppTheme.border,
    backgroundColor: AppTheme.track,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
  },
  balanceLabel: {
    color: AppTheme.textFaint,
    fontSize: 11,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  balanceValue: {
    color: AppTheme.text,
    fontSize: 28,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.6,
  },
  fieldLabel: {
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.semibold,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppTheme.border,
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: AppTheme.accent,
    borderColor: AppTheme.accent,
  },
  chipText: {
    color: AppTheme.text,
    fontSize: 14,
    fontFamily: FontFamily.semibold,
  },
  chipTextActive: {
    color: '#fff',
  },
  note: {
    color: AppTheme.textFaint,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
  },
});
