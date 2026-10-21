import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { LiquidGlass } from '@/components/ui/LiquidGlass';

type Item<T extends string> = { key: T; label: string };

type Props<T extends string> = {
  items: Item<T>[];
  value: T;
  onChange: (key: T) => void;
  /** Fractional page index from content pager (0 = first tab). Keeps rail in sync while swiping. */
  progress?: number;
};

type TabLayout = { x: number; width: number; height: number };

function layoutAtProgress<T extends string>(
  progress: number,
  items: Item<T>[],
  layouts: Record<string, TabLayout>,
) {
  const max = items.length - 1;
  const clamped = Math.min(max, Math.max(0, progress));
  const i0 = Math.floor(clamped);
  const i1 = Math.min(max, i0 + 1);
  const t = clamped - i0;
  const a = layouts[items[i0]?.key];
  const b = layouts[items[i1]?.key];
  if (!a || !b) return null;
  return {
    x: a.x + (b.x - a.x) * t,
    width: a.width + (b.width - a.width) * t,
    height: a.height + (b.height - a.height) * t,
  };
}

/**
 * Copilot-style rail — sliding pill tracks pager swipe fractionally.
 */
export function PillTabs<T extends string>({
  items,
  value,
  onChange,
  progress: progressProp,
}: Props<T>) {
  const scrollRef = useRef<ScrollView>(null);
  const layouts = useRef<Record<string, TabLayout>>({});
  const [railWidth, setRailWidth] = useState(0);
  const [version, setVersion] = useState(0);

  const progress =
    progressProp ?? Math.max(0, items.findIndex((i) => i.key === value));

  /** Inset so the active tab can scroll toward center on wide screens. */
  const sidePad = useMemo(() => {
    if (railWidth <= 0) return AppTheme.edgePadH;
    return Math.max(AppTheme.edgePadH, railWidth / 2 - 56);
  }, [railWidth]);

  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);
  const indicatorH = useSharedValue(42);
  const indicatorOpacity = useSharedValue(0);
  const labelProgress = useSharedValue(progress);

  const applyLayout = useCallback(
    (layout: TabLayout, nextProgress: number) => {
      indicatorX.value = layout.x;
      indicatorW.value = layout.width;
      indicatorH.value = layout.height;
      labelProgress.value = nextProgress;
      if (layout.width > 0) {
        indicatorOpacity.value = 1;
      }
    },
    [indicatorH, indicatorOpacity, indicatorW, indicatorX, labelProgress],
  );

  const scrollToProgress = useCallback(
    (p: number) => {
      if (!railWidth) return;
      const max = items.length - 1;
      const clamped = Math.min(max, Math.max(0, p));
      const i0 = Math.floor(clamped);
      const i1 = Math.min(max, i0 + 1);
      const t = clamped - i0;
      const a = layouts.current[items[i0].key];
      const b = layouts.current[items[i1].key];
      if (!a || !b) return;
      const midA = a.x + a.width / 2;
      const midB = b.x + b.width / 2;
      const mid = midA + (midB - midA) * t;
      const target = Math.max(0, mid - railWidth / 2);
      scrollRef.current?.scrollTo({ x: target, animated: false });
    },
    [items, railWidth],
  );

  useEffect(() => {
    const layout = layoutAtProgress(progress, items, layouts.current);
    if (!layout) return;

    applyLayout(layout, progress);
    scrollToProgress(progress);
  }, [progress, items, version, applyLayout, scrollToProgress]);

  const onRailLayout = (e: LayoutChangeEvent) => {
    const width = Math.round(e.nativeEvent.layout.width);
    if (width > 0 && width !== railWidth) {
      setRailWidth(width);
    }
  };

  const onTabLayout = (key: T, e: LayoutChangeEvent) => {
    const { x, width, height } = e.nativeEvent.layout;
    const prev = layouts.current[key];
    if (prev && prev.x === x && prev.width === width && prev.height === height) return;
    layouts.current[key] = { x, width, height };
    if (key === value && (!prev || indicatorW.value === 0)) {
      applyLayout({ x, width, height }, progress);
    }
    setVersion((v) => v + 1);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    transform: [{ translateX: indicatorX.value }],
    width: indicatorW.value,
    height: indicatorH.value,
  }));

  const activeIndex = Math.round(progress);
  const railReady = railWidth > 0;

  return (
    <View style={styles.wrap} onLayout={onRailLayout}>
      {railReady ? (
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={[styles.row, { paddingHorizontal: sidePad }]}>
          <Animated.View pointerEvents="none" style={[styles.indicatorHost, indicatorStyle]}>
            <LiquidGlass
              style={styles.indicatorGlass}
              surface="accent"
              tintColor={AppTheme.accent}
              contentStyle={styles.indicatorInner}
            />
          </Animated.View>
          {items.map((item, index) => (
            <PillLabel
              key={item.key}
              label={item.label}
              index={index}
              progress={labelProgress}
              onPress={() => onChange(item.key)}
              onLayout={(e) => onTabLayout(item.key, e)}
              selected={index === activeIndex}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

function PillLabel({
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
      color: interpolateColor(dist, [0, 1], ['#ffffff', AppTheme.text]),
    };
  });

  return (
    <Pressable
      onPress={onPress}
      onLayout={onLayout}
      style={styles.pill}
      accessibilityRole="tab"
      accessibilityState={{ selected }}>
      <Animated.Text
        style={[styles.label, selected ? styles.labelActive : styles.labelInactive, textStyle]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    minHeight: 44,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 3,
    position: 'relative',
  },
  indicatorHost: {
    position: 'absolute',
    left: 0,
    top: 3,
    borderRadius: 20,
    overflow: 'hidden',
  },
  indicatorGlass: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20,
  },
  indicatorInner: {
    flex: 1,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    zIndex: 1,
  },
  label: {
    fontSize: 15,
    letterSpacing: -0.25,
  },
  labelActive: {
    fontFamily: FontFamily.semibold,
  },
  labelInactive: {
    fontFamily: FontFamily.medium,
  },
});
