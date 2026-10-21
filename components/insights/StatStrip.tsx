import { StyleSheet, View } from 'react-native';

import { MetricValue } from '@/components/insights/MetricValue';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import type { HealthTone } from '@/constants/MetricHealth';

export type StatItem = {
  value: string;
  label: string;
  tone?: HealthTone;
};

type Props = {
  items: StatItem[];
};

/** 2–3 metric columns — optional per-stat health tone. */
export function StatStrip({ items }: Props) {
  return (
    <LiquidGlass style={styles.cardShell} intensity={48} contentStyle={styles.card}>
      {items.map((item, i) => (
        <View key={item.label} style={styles.colWrap}>
          {i > 0 ? <View style={styles.divider} /> : null}
          <View style={styles.col}>
            <MetricValue tone={item.tone ?? 'stable'} size="sm" style={styles.value}>
              {item.value}
            </MetricValue>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        </View>
      ))}
    </LiquidGlass>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    borderRadius: 16,
  },
  card: {
    paddingVertical: 14,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  colWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: AppTheme.borderStrong,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  value: {
    textAlign: 'center',
  },
  label: {
    color: AppTheme.textFaint,
    fontSize: 10,
    fontFamily: FontFamily.regular,
    marginTop: 3,
    textAlign: 'center',
  },
});
