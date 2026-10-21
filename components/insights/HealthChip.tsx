import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import {
  HEALTH_CHIP_BG,
  HEALTH_COLORS,
  HEALTH_LABEL,
  type HealthTone,
} from '@/constants/MetricHealth';

type Props = {
  tone: HealthTone;
};

const TREND_ICON: Record<HealthTone, keyof typeof Ionicons.glyphMap> = {
  strong: 'trending-up',
  stable: 'remove-outline',
  watch: 'trending-down',
  trouble: 'trending-down',
};

/** Compact trend mark — up / flat / down instead of Strong/Watch text. */
export function HealthChip({ tone }: Props) {
  return (
    <View
      style={[styles.chip, { backgroundColor: HEALTH_CHIP_BG[tone] }]}
      accessibilityRole="image"
      accessibilityLabel={HEALTH_LABEL[tone]}>
      <Ionicons name={TREND_ICON[tone]} size={14} color={HEALTH_COLORS[tone]} />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
