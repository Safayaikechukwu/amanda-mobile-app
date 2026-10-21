import { useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { LiquidGlass } from '@/components/ui/LiquidGlass';

type Item<T extends string> = { key: T; label: string };

type Props<T extends string> = {
  items: Item<T>[];
  value: T;
  onChange: (key: T) => void;
  /** Active pill — defaults to app accent; pass bucket theme on savings pages. */
  accentColor?: string;
};

type TabLayout = { x: number; width: number };

const DURATION = 280;
const TRACK_PAD = 3;
const TAB_HEIGHT = 32;

/**
 * Nested Copilot-style rail with a sliding active pill (Categories ↔ Recipients, etc.).
 */
export function SegmentRail<T extends string>({
  items,
  value,
  onChange,
}: Props<T>) {
  const layouts = useRef<Record<string, TabLayout>>({});
  const [measured, setMeasured] = useState(0);
  const activeIndex = Math.max(0, items.findIndex((i) => i.key === value));

  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);
  const progress = useSharedValue(activeIndex);

  const syncIndicator = (key: string, animate: boolean) => {
    const layout = layouts.current[key];
    if (!layout) return;
    if (animate) {
      indicatorX.value = withTiming(layout.x, { duration: DURATION });
      indicatorW.value = withTiming(layout.width, { duration: DURATION });
      progress.value = withTiming(activeIndex, { duration: DURATION });
    } else {
      indicatorX.value = layout.x;
      indicatorW.value = layout.width;
      progress.value = activeIndex;
    }
  };

  useEffect(() => {
    syncIndicator(items[activeIndex]?.key ?? items[0]?.key, true);
  }, [activeIndex, measured, items]);

  const onTabLayout = (key: T, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    const rounded = { x: Math.round(x), width: Math.round(width) };
    const prev = layouts.current[key];
    if (prev?.x === rounded.x && prev?.width === rounded.width) return;
    layouts.current[key] = rounded;
    if (key === value) {
      syncIndicator(key, indicatorW.value > 0);
    }
    setMeasured((v) => v + 1);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: Math.max(indicatorW.value, 0),
  }));

  return (
    <View style={styles.track}>
      <View style={styles.row}>
        <Animated.View pointerEvents="none" style={[styles.indicatorHost, indicatorStyle]}>
          <LiquidGlass
            style={styles.indicatorGlass}
            surface="accent"
            tintColor={AppTheme.accent}
            contentStyle={styles.indicatorInner}
          />
        </Animated.View>
        {items.map((item, index) => (
          <SegmentLabel
            key={item.key}
            label={item.label}
            index={index}
            progress={progress}
            onPress={() => onChange(item.key)}
            onLayout={(e) => onTabLayout(item.key, e)}
            selected={item.key === value}
          />
        ))}
      </View>
    </View>
  );
}

function SegmentLabel({
  label,
  index,
  progress,
  onPress,
  onLayout,
  selected,
}: {
  label: string;
  index: number;
  progress: SharedValue<number>;
  onPress: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
  selected: boolean;
}) {
  const textStyle = useAnimatedStyle(() => {
    const dist = Math.min(1, Math.abs(progress.value - index));
    return {
      color: interpolateColor(dist, [0, 1], ['#ffffff', AppTheme.textFaint]),
    };
  });

  return (
    <View onLayout={onLayout} style={styles.tabSlot}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
        accessibilityRole="tab"
        accessibilityState={{ selected }}>
        <Animated.Text style={[styles.label, textStyle]}>{label}</Animated.Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    position: 'relative',
    padding: TRACK_PAD,
    minHeight: TAB_HEIGHT + TRACK_PAD * 2,
  },
  indicatorHost: {
    position: 'absolute',
    left: 0,
    top: TRACK_PAD,
    height: TAB_HEIGHT,
    borderRadius: TAB_HEIGHT / 2,
    overflow: 'hidden',
  },
  indicatorGlass: {
    ...StyleSheet.absoluteFill,
    borderRadius: TAB_HEIGHT / 2,
  },
  indicatorInner: {
    flex: 1,
  },
  tabSlot: {
    height: TAB_HEIGHT,
  },
  pill: {
    height: TAB_HEIGHT,
    paddingHorizontal: 12,
    borderRadius: TAB_HEIGHT / 2,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({ outlineStyle: 'none' } as object)
      : null),
  },
  pillPressed: {
    opacity: 0.88,
  },
  label: {
    fontSize: 13,
    lineHeight: 15,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
});
