import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
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

import { BUCKET_LAYOUT } from '@/components/savings/bucketStyles';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_SIZE = 220;
const RING_STROKE = 10;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_C = 2 * Math.PI * RING_R;
const GAP = 4;

const RING_DURATION = 1000;
const RING_EASE = Easing.bezier(0.22, 1, 0.36, 1);

/** Icon-only legend from this count — keeps the ring area one clean row. */
const LEGEND_COMPACT_AT = 5;

export type SavingsRingPlan = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  colorBg: string;
  amount: number;
};

type Segment = {
  id: string;
  targetLen: number;
  offset: number;
  stroke: string;
};

type Props = {
  plans: SavingsRingPlan[];
  total: number;
  formatAmount: (amount: number) => string;
  onPlanPress?: (planId: string) => void;
  totalLabel: string;
  countLabel: (activeCount: number) => string;
  fallbackAccent: string;
};

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

function RingLegend({
  plans,
  formatAmount,
  onPlanPress,
}: {
  plans: SavingsRingPlan[];
  formatAmount: (amount: number) => string;
  onPlanPress?: (planId: string) => void;
}) {
  const compact = plans.length >= LEGEND_COMPACT_AT;
  const centerWhenFew = plans.length <= 3;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.legendScroll}
      contentContainerStyle={[
        styles.legendScrollContent,
        centerWhenFew && styles.legendScrollCentered,
      ]}>
      {plans.map((plan) => {
        const label = `${plan.title}, ${formatAmount(plan.amount)}`;

        if (compact) {
          return (
            <Pressable
              key={plan.id}
              onPress={() => onPlanPress?.(plan.id)}
              style={({ pressed }) => [
                styles.legendIconChip,
                { borderColor: plan.color, backgroundColor: plan.colorBg },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={label}>
              <Text style={styles.legendEmoji}>{plan.emoji}</Text>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={plan.id}
            onPress={() => onPlanPress?.(plan.id)}
            style={({ pressed }) => [styles.legendChip, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={label}>
            <View style={[styles.legendDot, { backgroundColor: plan.colorBg }]}>
              <Text style={styles.legendEmoji}>{plan.emoji}</Text>
            </View>
            <Text style={styles.legendLabel} numberOfLines={1}>
              {plan.title}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function SavingsPlansRing({
  plans,
  total,
  formatAmount,
  onPlanPress,
  totalLabel,
  countLabel,
  fallbackAccent,
}: Props) {
  const progress = useSharedValue(0);
  const centerOpacity = useSharedValue(0);
  const centerScale = useSharedValue(0.9);
  const ringScale = useSharedValue(0.94);

  const segmentTotal = useMemo(
    () => plans.reduce((sum, plan) => sum + plan.amount, 0),
    [plans],
  );

  const segments = useMemo(() => {
    let acc = 0;
    const usable = Math.max(RING_C - GAP * Math.max(plans.length, 1), 1);
    if (plans.length === 0) return [];

    return plans.map((plan) => {
      const share = segmentTotal > 0 ? plan.amount / segmentTotal : 0;
      const len = Math.max(usable * share - GAP, 0);
      const offset = -acc;
      acc += len + GAP;
      return {
        id: plan.id,
        targetLen: len,
        offset,
        stroke: plan.color,
      };
    });
  }, [plans, segmentTotal]);

  const dataKey = useMemo(
    () => plans.map((p) => `${p.id}:${p.amount}:${p.color}`).join('|'),
    [plans],
  );
  const lastAnimatedKey = useRef<string | null>(null);

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

    ringScale.value = withTiming(1, { duration: 780, easing: RING_EASE });
    progress.value = withTiming(1, { duration: RING_DURATION, easing: RING_EASE });
    centerOpacity.value = withDelay(380, withTiming(1, { duration: 460, easing: RING_EASE }));
    centerScale.value = withDelay(380, withTiming(1, { duration: 460, easing: RING_EASE }));
  }, [centerOpacity, centerScale, progress, ringScale]);

  useEffect(() => {
    if (lastAnimatedKey.current === dataKey) {
      snapToEnd();
      return;
    }

    lastAnimatedKey.current = dataKey;
    play();
  }, [dataKey, play, snapToEnd]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  const centerStyle = useAnimatedStyle(() => ({
    opacity: centerOpacity.value,
    transform: [{ scale: centerScale.value }],
  }));

  const activeCount = plans.length;

  return (
    <View style={styles.wrap}>
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
          {segments.length === 0 ? (
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_R}
              stroke={`${fallbackAccent}33`}
              strokeWidth={RING_STROKE}
              fill="none"
              strokeDasharray={`${RING_C * 0.12} ${RING_C}`}
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          ) : (
            segments.map((segment) => (
              <RingSegment key={segment.id} segment={segment} progress={progress} />
            ))
          )}
        </Svg>
        <Animated.View style={[styles.ringCopy, centerStyle]} pointerEvents="none">
          <Text style={styles.ringLabel}>{totalLabel}</Text>
          <Text
            style={styles.ringAmount}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}>
            {formatAmount(total)}
          </Text>
          <Text style={styles.ringGoal}>{countLabel(activeCount)}</Text>
        </Animated.View>
      </Animated.View>

      {plans.length > 0 ? (
        <RingLegend plans={plans} formatAmount={formatAmount} onPlanPress={onPlanPress} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
    marginBottom: BUCKET_LAYOUT.heroBottomPad,
    alignSelf: 'stretch',
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  legendScroll: {
    alignSelf: 'stretch',
    maxHeight: 28,
  },
  legendScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 2,
  },
  legendScrollCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: AppTheme.composer,
  },
  legendIconChip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendEmoji: {
    fontSize: 10,
    lineHeight: 12,
  },
  legendLabel: {
    color: AppTheme.text,
    fontSize: 10,
    fontFamily: FontFamily.medium,
    letterSpacing: -0.1,
    maxWidth: 108,
  },
  pressed: { opacity: 0.85 },
});
