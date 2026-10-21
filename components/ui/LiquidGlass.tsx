import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { type ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppTheme } from '@/constants/AppTheme';

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Blur strength for the BlurView fallback (iOS <26 / Android / web). */
  intensity?: number;
  contentStyle?: StyleProp<ViewStyle>;
  /** Tint passed to native GlassView; also used as solid fill on non-glass platforms. */
  tintColor?: string;
  /** Optional wash over blur — frosted fallback only. */
  washColor?: string;
  /** Native glass touch layer — keep false when children must receive taps. */
  interactive?: boolean;
  /**
   * `accent` — brand-tinted material (native glass on iOS, solid fill elsewhere).
   * `frosted` — neutral frosted material.
   */
  surface?: 'frosted' | 'accent';
};

const nativeGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable();

/**
 * Liquid-glass surface — native GlassView on iOS 26+ (real system material).
 * No fake gloss overlays. Non-iOS accent surfaces fall back to a flat brand fill.
 */
export function LiquidGlass({
  children,
  style,
  intensity = 55,
  contentStyle,
  tintColor = 'rgba(255,255,255,0.45)',
  washColor,
  interactive = false,
  surface = 'frosted',
}: Props) {
  if (nativeGlassAvailable) {
    return (
      <GlassView
        style={[styles.clip, style]}
        glassEffectStyle="regular"
        tintColor={tintColor}
        colorScheme="light"
        isInteractive={interactive}>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </GlassView>
    );
  }

  if (surface === 'accent') {
    return (
      <View
        style={[styles.clip, { backgroundColor: tintColor ?? AppTheme.accent }, style]}>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[styles.clip, styles.frostedShell, style]}>
      <BlurView
        intensity={intensity}
        tint="light"
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        style={StyleSheet.absoluteFill}
      />
      {washColor ? (
        <View style={[styles.frostedWash, { backgroundColor: washColor }]} pointerEvents="none" />
      ) : null}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  frostedShell: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(13,13,13,0.06)',
    backgroundColor: 'transparent',
  },
  frostedWash: {
    ...StyleSheet.absoluteFill,
    opacity: 0.45,
  },
});
