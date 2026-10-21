import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { FontFamily } from '@/constants/Fonts';
import { HEALTH_COLORS, type HealthTone } from '@/constants/MetricHealth';

type Size = 'sm' | 'md' | 'lg' | 'xl';

type Props = {
  children: string;
  tone?: HealthTone;
  size?: Size;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

const SIZE: Record<Size, { fontSize: number; letterSpacing: number }> = {
  sm: { fontSize: 14, letterSpacing: -0.2 },
  md: { fontSize: 16, letterSpacing: -0.3 },
  lg: { fontSize: 20, letterSpacing: -0.45 },
  xl: { fontSize: 28, letterSpacing: -0.7 },
};

/** Colored metric number — health tone drives attention. */
export function MetricValue({
  children,
  tone = 'stable',
  size = 'md',
  style,
  numberOfLines = 1,
}: Props) {
  const s = SIZE[size];
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        styles.base,
        { color: HEALTH_COLORS[tone], fontSize: s.fontSize, letterSpacing: s.letterSpacing },
        style,
      ]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: FontFamily.bold,
  },
});
