import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { AppTheme } from '@/constants/AppTheme';

type Edge = 'top' | 'bottom';

type Props = {
  edge?: Edge;
  height?: number;
  style?: StyleProp<ViewStyle>;
  scrollY?: SharedValue<number>;
  maxScrollY?: SharedValue<number>;
};

/** Soft dissolve — no hard band, no tint wash, no hairline. */
const DEFAULT_HEIGHT = 72;

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

function fadeStops(edge: Edge) {
  // Long, mostly transparent — only the last pixels near the edge lift opacity.
  if (edge === 'top') {
    return {
      colors: ['rgba(255,255,255,0.82)', 'rgba(255,255,255,0.28)', 'rgba(255,255,255,0)'] as const,
      locations: [0, 0.18, 1] as const,
    };
  }
  return {
    colors: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.28)', 'rgba(255,255,255,0.82)'] as const,
    locations: [0, 0.82, 1] as const,
  };
}

/** Scroll edge dissolve — subtle material, not a visible box. */
export function ScrollEdgeBlur({
  edge = 'top',
  height = DEFAULT_HEIGHT,
  style,
  scrollY,
  maxScrollY,
}: Props) {
  const stops = fadeStops(edge);

  const fadeStyle = useAnimatedStyle(() => {
    if (!scrollY) return { opacity: 1 };

    if (edge === 'top') {
      return {
        opacity: interpolate(scrollY.value, [0, 12, 48], [0, 0.35, 1], Extrapolation.CLAMP),
      };
    }

    if (!maxScrollY) return { opacity: 0 };

    const max = Math.max(maxScrollY.value, 1);
    return {
      opacity: interpolate(scrollY.value, [max - 56, max - 8], [1, 0], Extrapolation.CLAMP),
    };
  }, [edge, maxScrollY, scrollY]);

  return (
    <Animated.View
      style={[
        styles.host,
        edge === 'top' ? styles.top : styles.bottom,
        { height },
        fadeStyle,
        style,
      ]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      {Platform.OS !== 'web' ? (
        <BlurView
          intensity={22}
          tint="light"
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <AnimatedLinearGradient
        colors={stops.colors}
        locations={stops.locations}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 2,
  },
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
  },
});
