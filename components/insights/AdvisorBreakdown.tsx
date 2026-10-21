import { StyleSheet, View } from 'react-native';

import { HealthChip } from '@/components/insights/HealthChip';
import { MetricValue } from '@/components/insights/MetricValue';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import {
  toneFromFreeCash,
  toneFromRunwayWeeks,
  toneFromUdaraScore,
  type HealthTone,
} from '@/constants/MetricHealth';
import { formatNaira } from '@/constants/MockInsights';

export type AdvisorMetrics = {
  runway: string;
  runwayWeeks: number;
  runwayHint: string;
  freeCash: number;
  freeCashHint: string;
  earned: number;
  udaraScore: number;
  udaraHint: string;
};

type Props = {
  metrics: AdvisorMetrics;
};

/**
 * Runway · free cash · Udara Score —
 * health shows on the number + chip only (cards stay neutral).
 */
export function AdvisorBreakdown({ metrics }: Props) {
  const freeNegative = metrics.freeCash < 0;
  const items: {
    key: string;
    value: string;
    label: string;
    hint: string;
    tone: HealthTone;
    size: 'md' | 'lg';
  }[] = [
    {
      key: 'runway',
      value: metrics.runway,
      label: 'Runway',
      hint: metrics.runwayHint,
      tone: toneFromRunwayWeeks(metrics.runwayWeeks),
      size: 'lg',
    },
    {
      key: 'free',
      value: `${freeNegative ? '−' : ''}${formatNaira(metrics.freeCash)}`,
      label: 'Free cash',
      hint: metrics.freeCashHint,
      tone: toneFromFreeCash(metrics.freeCash, metrics.earned),
      size: 'md',
    },
    {
      key: 'udara',
      value: String(metrics.udaraScore),
      label: 'Udara Score',
      hint: metrics.udaraHint,
      tone: toneFromUdaraScore(metrics.udaraScore),
      size: 'lg',
    },
  ];

  return (
    <View style={styles.wrap}>
      {items.map((item) => (
        <LiquidGlass key={item.key} style={styles.cardShell} intensity={45} contentStyle={styles.card}>
          <Text style={styles.label}>{item.label}</Text>
          <MetricValue tone={item.tone} size={item.size}>
            {item.value}
          </MetricValue>
          <View style={styles.chipRow}>
            <HealthChip tone={item.tone} />
          </View>
          <Text style={styles.hint}>{item.hint}</Text>
        </LiquidGlass>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 8,
  },
  cardShell: {
    flex: 1,
    borderRadius: 14,
  },
  card: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    minHeight: 102,
  },
  label: {
    color: AppTheme.textFaint,
    fontSize: 10,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.35,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  chipRow: {
    marginTop: 6,
  },
  hint: {
    color: AppTheme.textFaint,
    fontSize: 10,
    fontFamily: FontFamily.regular,
    marginTop: 3,
    lineHeight: 13,
  },
});
