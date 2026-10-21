import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';

export type GlassPressableVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
export type GlassPressableSize = 'sm' | 'md' | 'lg';

type Props = {
  label?: string;
  onPress: () => void;
  variant?: GlassPressableVariant;
  size?: GlassPressableSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accentColor?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const SIZES: Record<
  GlassPressableSize,
  { minHeight: number; radius: number; fontSize: number; px: number; py: number; intensity: number }
> = {
  sm: { minHeight: 0, radius: 999, fontSize: 12, px: 12, py: 6, intensity: 42 },
  md: { minHeight: 48, radius: 24, fontSize: 16, px: 18, py: 12, intensity: 46 },
  lg: { minHeight: 56, radius: 28, fontSize: 17, px: 22, py: 14, intensity: 48 },
};

function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace('#', '').trim();
  if (raw.length !== 6) return `rgba(74, 5, 8, ${alpha})`;
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type GlassSpec = {
  surface: 'frosted' | 'accent';
  tintColor: string;
  washColor?: string;
  labelColor: string;
};

function glassSpec(variant: GlassPressableVariant, accent: string, inactive?: boolean): GlassSpec {
  switch (variant) {
    case 'primary':
      return {
        surface: 'accent',
        tintColor: inactive ? hexToRgba(accent, 0.48) : accent,
        labelColor: inactive ? 'rgba(255,255,255,0.58)' : '#ffffff',
      };
    case 'destructive':
      return {
        surface: 'accent',
        tintColor: inactive ? 'rgba(185, 28, 28, 0.48)' : '#b91c1c',
        labelColor: inactive ? 'rgba(255,255,255,0.58)' : '#ffffff',
      };
    case 'ghost':
      return {
        surface: 'frosted',
        tintColor: 'rgba(255,255,255,0.55)',
        washColor: 'rgba(255,255,255,0.72)',
        labelColor: AppTheme.accent,
      };
    case 'secondary':
    default:
      return {
        surface: 'frosted',
        tintColor: 'rgba(255,255,255,0.55)',
        washColor: AppTheme.composer,
        labelColor: AppTheme.text,
      };
  }
}

/** Pressable backed by native liquid glass on iOS — flat brand fill on web/Android. */
export function GlassPressable({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled,
  loading,
  fullWidth = true,
  accentColor,
  children,
  style,
  accessibilityLabel,
}: Props) {
  const inactive = disabled || loading;
  const dim = SIZES[size];
  const accent = accentColor ?? AppTheme.accent;
  const spec = glassSpec(variant, accent, inactive);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.hit,
        fullWidth && styles.fullWidth,
        !fullWidth && styles.shrink,
        pressed && !inactive && styles.pressed,
      ]}>
      <LiquidGlass
        style={[
          styles.glass,
          fullWidth && styles.glassFull,
          { borderRadius: dim.radius },
          style,
        ]}
        surface={spec.surface}
        intensity={dim.intensity}
        tintColor={spec.tintColor}
        washColor={spec.washColor}
        contentStyle={[
          styles.inner,
          {
            minHeight: dim.minHeight || undefined,
            paddingHorizontal: dim.px,
            paddingVertical: dim.py,
            borderRadius: dim.radius,
          },
        ]}>
        {loading ? (
          <ActivityIndicator color={spec.labelColor} />
        ) : children ? (
          <View style={styles.childRow}>{children}</View>
        ) : (
          <Text
            style={[
              styles.label,
              {
                fontSize: dim.fontSize,
                color: spec.labelColor,
              },
            ]}>
            {label}
          </Text>
        )}
      </LiquidGlass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  shrink: {
    alignSelf: 'center',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  glass: {
    overflow: 'hidden',
  },
  glassFull: {
    width: '100%',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: {
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.15,
    textAlign: 'center',
  },
});
