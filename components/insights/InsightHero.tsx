import { StyleSheet, View } from 'react-native';

import { HealthChip } from '@/components/insights/HealthChip';
import { MetricValue } from '@/components/insights/MetricValue';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import type { HealthTone } from '@/constants/MetricHealth';

type Props = {
  amount: string;
  caption: string;
  /** Soft supporting line under caption */
  hint?: string;
  tone?: HealthTone;
  showChip?: boolean;
};

/** Big number + caption — health tone colors the number only. */
export function InsightHero({
  amount,
  caption,
  hint,
  tone = 'stable',
  showChip = true,
}: Props) {
  return (
    <LiquidGlass style={styles.cardShell} intensity={48} contentStyle={styles.card}>
      <View style={styles.top}>
        <MetricValue tone={tone} size="xl" style={styles.amount}>
          {amount}
        </MetricValue>
        {showChip ? <HealthChip tone={tone} /> : null}
      </View>
      <Text style={styles.caption}>{caption}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </LiquidGlass>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    borderRadius: 16,
  },
  card: {
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  amount: {
    flexShrink: 1,
  },
  caption: {
    color: AppTheme.textMuted,
    fontSize: 14,
    fontFamily: FontFamily.medium,
    marginTop: 6,
  },
  hint: {
    color: AppTheme.textFaint,
    fontSize: 12,
    fontFamily: FontFamily.regular,
    marginTop: 4,
  },
});
