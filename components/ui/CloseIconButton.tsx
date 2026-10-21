import { Ionicons } from '@expo/vector-icons';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Platform, Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { NAV_ICON_BUTTON_SIZE } from '@/components/ui/BackIconButton';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { AppTheme } from '@/constants/AppTheme';

type IconName = 'close' | 'close-circle';

type Props = {
  onPress: () => void;
  size?: number;
  icon?: IconName;
  /** `well` = glass circle. `plain` = icon only. */
  variant?: 'well' | 'plain';
  accessibilityLabel?: string;
  style?: ViewStyle;
  hitSlop?: number;
  disabled?: boolean;
};

const ACCENT_GLASS_TINT = 'rgba(74, 5, 8, 0.22)';
const ACCENT_GLASS_WASH = 'rgba(74, 5, 8, 0.06)';

/** Dismiss / close control — liquid glass well on supported iOS. */
export function CloseIconButton({
  onPress,
  size = 20,
  icon = 'close',
  variant = 'well',
  accessibilityLabel = 'Close',
  style,
  hitSlop = 8,
  disabled,
}: Props) {
  const circle = {
    width: NAV_ICON_BUTTON_SIZE,
    height: NAV_ICON_BUTTON_SIZE,
    borderRadius: NAV_ICON_BUTTON_SIZE / 2,
  } as const;
  const useGlass = variant === 'well' && Platform.OS === 'ios' && isLiquidGlassAvailable();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      style={({ pressed }) => [styles.base, pressed && !disabled && styles.pressed, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      {variant === 'well' && useGlass ? (
        <LiquidGlass
          style={[styles.glass, circle]}
          intensity={46}
          tintColor={ACCENT_GLASS_TINT}
          washColor={ACCENT_GLASS_WASH}
          contentStyle={[styles.glassInner, circle]}>
          <Ionicons name={icon} size={size} color={AppTheme.accent} />
        </LiquidGlass>
      ) : variant === 'well' ? (
        <View style={[styles.well, circle]}>
          <Ionicons name={icon} size={size} color={AppTheme.accent} />
        </View>
      ) : (
        <Ionicons name={icon} size={size} color={AppTheme.accent} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glass: {
    borderWidth: 0,
  },
  glassInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  well: {
    backgroundColor: AppTheme.composer,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppTheme.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pressed: { opacity: 0.75 },
});
