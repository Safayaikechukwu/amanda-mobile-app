import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';

type Props = {
  label: string;
  onPress: () => void;
  accentColor?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** Compact solid pill for savings table rows — no blur (avoids corner artifacts). */
export function TableActionButton({
  label,
  onPress,
  accentColor = AppTheme.accent,
  accessibilityLabel,
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: accentColor },
        pressed && styles.pressed,
        style,
      ]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minWidth: 52,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 12,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.1,
  },
  pressed: { opacity: 0.88 },
});
