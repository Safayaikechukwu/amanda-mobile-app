import { StyleSheet, View } from 'react-native';

import { GlassPressable } from '@/components/ui/GlassPressable';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';

type Props = {
  summary: string;
  onChangePress: () => void;
};

export function SpendingLimitsCard({ summary, onChangePress }: Props) {
  return (
    <LiquidGlass style={styles.shell} intensity={42} contentStyle={styles.card}>
      <Text style={styles.summary}>{summary}</Text>
      <GlassPressable
        label="Change with Udara"
        onPress={onChangePress}
        variant="secondary"
        size="md"
        fullWidth
      />
    </LiquidGlass>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(60,60,67,0.12)',
  },
  card: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 14,
  },
  summary: {
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.semibold,
    lineHeight: 22,
    textAlign: 'center',
  },
});
