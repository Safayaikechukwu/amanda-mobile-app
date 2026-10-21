import { Ionicons } from '@expo/vector-icons';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Pressable, Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { AppTheme } from '@/constants/AppTheme';

export const NAV_ICON_BUTTON_SIZE = 40;

type Variant = 'auto' | 'glass' | 'solid' | 'plain';

type Props = {
  onPress: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
  size?: number;
  variant?: Variant;
};

function resolveVariant(variant: Variant): 'glass' | 'solid' | 'plain' {
  if (variant === 'glass' || variant === 'solid' || variant === 'plain') return variant;
  return Platform.OS === 'ios' && isLiquidGlassAvailable() ? 'glass' : 'solid';
}

function circleStyle(size: number) {
  return {
    width: size,
    height: size,
    borderRadius: size / 2,
  } as const;
}

/** Frosted circular back control — settings, detail screens, and nav bars. */
export function BackIconButton({
  onPress,
  accessibilityLabel = 'Back',
  style,
  size = NAV_ICON_BUTTON_SIZE,
  variant = 'auto',
}: Props) {
  const resolved = resolveVariant(variant);
  const circle = circleStyle(size);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.hit, pressed && styles.pressed, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      {resolved === 'glass' ? (
        <LiquidGlass
          style={[styles.glass, circle]}
          intensity={54}
          tintColor="rgba(255,255,255,0.45)"
          washColor={AppTheme.composer}
          contentStyle={[styles.glassInner, circle]}>
          <Ionicons name="chevron-back" size={20} color={AppTheme.text} style={styles.icon} />
        </LiquidGlass>
      ) : resolved === 'plain' ? (
        <View style={[styles.plain, circle]}>
          <Ionicons name="chevron-back" size={22} color={AppTheme.text} style={styles.icon} />
        </View>
      ) : (
        <View style={[styles.solid, circle]}>
          <Ionicons name="chevron-back" size={20} color={AppTheme.text} style={styles.icon} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
  glass: {
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0d0d0d',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
      default: {
        boxShadow: '0 2px 14px rgba(13,13,13,0.09)',
      },
    }),
  },
  glassInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  solid: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.composer,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppTheme.border,
    overflow: 'hidden',
  },
  plain: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginLeft: -2,
  },
});
