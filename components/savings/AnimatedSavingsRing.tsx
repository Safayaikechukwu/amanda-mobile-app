import { useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import type { SavingsBucket } from '@/constants/MockData';
import { SavingsBucketTheme } from '@/constants/SavingsTheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_SIZE = 220;
const RING_STROKE = 10;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_C = 2 * Math.PI * RING_R;
const GAP = 4;

const RING_DURATION = 1100;
const RING_EASE = Easing.bezier(0.22, 1, 0.36, 1);

type Segment = {
  id: string;
  targetLen: number;
  offset: number;
  stroke: string;
};

type Props = {
  buckets: SavingsBucket[];
  formatAmount: (amount: number) => string;
  /** Ring intro — off when returning to Savings shortly after last visit. */
  animate?: boolean;
};

let lastRingIntroKey: string | null = null;

function RingSegment({
  segment,
  progress,
}: {
  segment: Segment;
  progress: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: `${Math.max(0, segment.targetLen * progress.value)} ${RING_C}`,
    strokeDashoffset: segment.offset,
  }));

  return (
    <AnimatedCircle
      animatedProps={animatedProps}
      cx={RING_SIZE / 2}
      cy={RING_SIZE / 2}
      r={RING_R}
      stroke={segment.stroke}
      strokeWidth={RING_STROKE}
      fill="none"
      strokeLinecap="butt"
      transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
    />
  );
}

export function AnimatedSavingsRing({ buckets, formatAmount, animate = true }: Props) {
  const progress = useSharedValue(animate ? 0 : 1);
  const centerOpacity = useSharedValue(animate ? 0 : 1);
  const centerScale = useSharedValue(animate ? 0.9 : 1);
  const ringScale = useSharedValue(animate ? 0.94 : 1);

  const total = useMemo(() => buckets.reduce((sum, b) => sum + b.amount, 0), [buckets]);

  const segments = useMemo(() => {
    let acc = 0;
    const usable = Math.max(RING_C - GAP * buckets.length, 1);
    return buckets.map((bucket) => {
      const share = total > 0 ? bucket.amount / total : 0;
      const len = Math.max(usable * share - GAP, 0);
      const offset = -acc;
      acc += len + GAP;
      return {
        id: bucket.id,
        targetLen: len,
        offset,
        stroke: SavingsBucketTheme[bucket.id].accent,
      };
    });
  }, [buckets, total]);

  const dataKey = useMemo(
    () => buckets.map((b) => `${b.id}:${b.amount}`).join('|'),
    [buckets],
  );

  const snapToEnd = useCallback(() => {
    progress.value = 1;
    centerOpacity.value = 1;
    centerScale.value = 1;
    ringScale.value = 1;
  }, [centerOpacity, centerScale, progress, ringScale]);

  const play = useCallback(() => {
    progress.value = 0;
    centerOpacity.value = 0;
    centerScale.value = 0.9;
    ringScale.value = 0.94;

    ringScale.value = withTiming(1, { duration: 820, easing: RING_EASE });
    progress.value = withTiming(1, { duration: RING_DURATION, easing: RING_EASE });
    centerOpacity.value = withDelay(420, withTiming(1, { duration: 480, easing: RING_EASE }));
    centerScale.value = withDelay(420, withTiming(1, { duration: 480, easing: RING_EASE }));
  }, [centerOpacity, centerScale, progress, ringScale]);

  useEffect(() => {
    if (!animate) {
      snapToEnd();
      lastRingIntroKey = dataKey;
      return;
    }

    if (lastRingIntroKey === dataKey) {
      snapToEnd();
      return;
    }

    lastRingIntroKey = dataKey;
    play();
  }, [animate, dataKey, play, snapToEnd]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  const centerStyle = useAnimatedStyle(() => ({
    opacity: centerOpacity.value,
    transform: [{ scale: centerScale.value }],
  }));

  return (
    <Animated.View style={[styles.ringWrap, ringStyle]}>
      <View style={styles.ringGlow} pointerEvents="none" />
      <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_R}
          stroke="rgba(13,13,13,0.06)"
          strokeWidth={RING_STROKE}
          fill="none"
        />
        {segments.map((segment) => (
          <RingSegment key={segment.id} segment={segment} progress={progress} />
        ))}
      </Svg>
      <Animated.View style={[styles.ringCopy, centerStyle]} pointerEvents="none">
        <Text style={styles.ringLabel}>TOTAL SAVINGS</Text>
        <Text
          style={styles.ringAmount}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}>
          {formatAmount(total)}
        </Text>
        <Text style={styles.ringGoal}>Across all buckets</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  ringGlow: {
    position: 'absolute',
    width: RING_SIZE - 28,
    height: RING_SIZE - 28,
    borderRadius: (RING_SIZE - 28) / 2,
    backgroundColor: 'rgba(13,13,13,0.03)',
  },
  ringSvg: { position: 'absolute' },
  ringCopy: {
    alignItems: 'center',
    maxWidth: RING_SIZE - RING_STROKE * 2 - 24,
    paddingHorizontal: 10,
    gap: 3,
  },
  ringLabel: {
    color: AppTheme.textMuted,
    fontSize: 9,
    fontFamily: FontFamily.semibold,
    letterSpacing: 1,
  },
  ringAmount: {
    color: AppTheme.text,
    fontSize: 22,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  ringGoal: {
    color: AppTheme.textMuted,
    fontSize: 11,
    fontFamily: FontFamily.regular,
  },
});
