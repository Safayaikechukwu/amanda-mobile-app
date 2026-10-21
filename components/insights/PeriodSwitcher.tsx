import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassPressable } from '@/components/ui/GlassPressable';
import { InlineDateCalendar, dateToIso } from '@/components/ui/InlineDateCalendar';
import { CloseIconButton } from '@/components/ui/CloseIconButton';
import { SheetGrabHandle } from '@/components/ui/SheetGrabHandle';
import { Text } from '@/components/ui/Text';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import type { CustomDateRange, InsightPeriod } from '@/constants/MockInsights';

const ANCHOR = new Date(2026, 7, 26);
const MIN_ISO = '2025-01-01';
const MAX_ISO = '2026-12-31';

const QUICK_RANGES = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
] as const;

const SLIDE_DURATION = 280;
const SLIDE_EASE = Easing.bezier(0.22, 1, 0.36, 1);
const TRACK_PADDING = 4;

type Props = {
  period: InsightPeriod;
  offset: number;
  customRange: CustomDateRange;
  onPeriodChange: (period: InsightPeriod) => void;
  onOffsetChange: (offset: number) => void;
  onCustomRangeChange: (range: CustomDateRange) => void;
};

function formatShort(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCompact(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

function quickRangeStart(days: number): string {
  const d = new Date(ANCHOR);
  d.setDate(d.getDate() - (days - 1));
  return dateToIso(d);
}

function anchorIso(): string {
  return dateToIso(ANCHOR);
}

function activeQuickDays(start: string, end: string): number | null {
  if (end !== anchorIso()) return null;
  for (const item of QUICK_RANGES) {
    if (start === quickRangeStart(item.days)) return item.days;
  }
  return null;
}

function rangeForPeriod(
  period: InsightPeriod,
  offset: number,
  customRange: CustomDateRange,
): CustomDateRange {
  if (period === 'custom') return customRange;

  const anchor = new Date(ANCHOR);
  if (period === 'day') {
    anchor.setDate(anchor.getDate() + offset);
    const iso = dateToIso(anchor);
    return { start: iso, end: iso };
  }

  if (period === 'week') {
    const end = new Date(ANCHOR);
    end.setDate(end.getDate() + offset * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    return { start: dateToIso(start), end: dateToIso(end) };
  }

  anchor.setMonth(anchor.getMonth() + offset);
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  return { start: dateToIso(start), end: dateToIso(end) };
}

export function formatPeriodRange(
  period: InsightPeriod,
  offset: number,
  customRange?: CustomDateRange,
): string {
  if (period === 'custom' && customRange) {
    return `${formatShort(customRange.start)} – ${formatShort(customRange.end)}`;
  }
  const d = new Date(ANCHOR);
  if (period === 'day') {
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    });
  }
  if (period === 'week') {
    const end = new Date(ANCHOR);
    end.setDate(end.getDate() + offset * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    const sameMonth = start.getMonth() === end.getMonth();
    const a = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const b = end.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: sameMonth ? undefined : 'short',
    });
    return `${a} – ${b}`;
  }
  d.setMonth(d.getMonth() + offset);
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

const webNoOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null;

function AnimatedSummaryDate({
  iso,
  active,
  align = 'left',
}: {
  iso: string;
  active: boolean;
  align?: 'left' | 'right';
}) {
  const activeProgress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    activeProgress.value = withTiming(active ? 1 : 0, {
      duration: SLIDE_DURATION,
      easing: SLIDE_EASE,
    });
  }, [active, activeProgress]);

  const valueStyle = useAnimatedStyle(() => ({
    color: interpolateColor(activeProgress.value, [0, 1], [AppTheme.text, AppTheme.accent]),
  }));

  return (
    <View style={[styles.summaryValueWrap, align === 'right' && styles.summaryValueWrapEnd]}>
      <Animated.Text
        key={iso}
        entering={FadeIn.duration(220).easing(SLIDE_EASE)}
        exiting={FadeOut.duration(160).easing(SLIDE_EASE)}
        style={[styles.summaryValue, valueStyle]}>
        {formatCompact(iso)}
      </Animated.Text>
    </View>
  );
}

function QuickRangeSegment({
  selectedDays,
  onSelect,
}: {
  selectedDays: number | null;
  onSelect: (days: number) => void;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const activeIndex = QUICK_RANGES.findIndex((item) => item.days === selectedDays);
  const segmentWidth =
    trackWidth > 0 ? (trackWidth - TRACK_PADDING * 2) / QUICK_RANGES.length : 0;

  const peelX = useSharedValue(TRACK_PADDING);
  const peelW = useSharedValue(0);
  const peelOpacity = useSharedValue(selectedDays != null ? 1 : 0);
  /** -1 when no preset matches — keeps all labels dark (never clamp -1 → 0). */
  const progress = useSharedValue(activeIndex >= 0 ? activeIndex : -1);

  useEffect(() => {
    if (activeIndex >= 0 && segmentWidth > 0) {
      if (peelW.value === 0) {
        peelX.value = TRACK_PADDING + activeIndex * segmentWidth;
        peelW.value = segmentWidth;
        peelOpacity.value = 1;
        progress.value = activeIndex;
        return;
      }

      peelX.value = withTiming(TRACK_PADDING + activeIndex * segmentWidth, {
        duration: SLIDE_DURATION,
        easing: SLIDE_EASE,
      });
      peelW.value = withTiming(segmentWidth, { duration: SLIDE_DURATION, easing: SLIDE_EASE });
      peelOpacity.value = withTiming(1, { duration: 200, easing: SLIDE_EASE });
      progress.value = withTiming(activeIndex, { duration: SLIDE_DURATION, easing: SLIDE_EASE });
      return;
    }

    peelOpacity.value = withTiming(0, { duration: 200, easing: SLIDE_EASE });
    progress.value = withTiming(-1, { duration: SLIDE_DURATION, easing: SLIDE_EASE });
  }, [activeIndex, segmentWidth, peelOpacity, peelW, peelX, progress]);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    if (width !== trackWidth) setTrackWidth(width);
  };

  const peelStyle = useAnimatedStyle(() => ({
    opacity: peelOpacity.value,
    transform: [{ translateX: peelX.value }],
    width: peelW.value,
  }));

  return (
    <View style={styles.quickTrack} onLayout={onTrackLayout}>
      <Animated.View pointerEvents="none" style={[styles.quickPeel, peelStyle]} />
      {QUICK_RANGES.map((item, index) => (
        <QuickRangeLabel
          key={item.days}
          label={item.label}
          index={index}
          progress={progress}
          onPress={() => onSelect(item.days)}
          selected={selectedDays === item.days}
        />
      ))}
    </View>
  );
}

function QuickRangeLabel({
  label,
  index,
  progress,
  onPress,
  selected,
}: {
  label: string;
  index: number;
  progress: SharedValue<number>;
  onPress: () => void;
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
      style={({ pressed }) => [styles.quickChip, pressed && styles.quickChipPressed, webNoOutline]}
      accessibilityRole="button"
      accessibilityState={{ selected }}>
      <Animated.Text style={[styles.quickChipText, textStyle]}>{label}</Animated.Text>
    </Pressable>
  );
}

export function PeriodSwitcher({
  period,
  offset,
  customRange,
  onPeriodChange,
  onOffsetChange,
  onCustomRangeChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(customRange.start);
  const [draftEnd, setDraftEnd] = useState(customRange.end);
  const [step, setStep] = useState<'start' | 'end'>('start');
  const [monthViewIso, setMonthViewIso] = useState(customRange.end);
  const insets = useSafeAreaInsets();

  const label = formatPeriodRange(period, offset, customRange);
  const selectedQuickDays = useMemo(
    () => activeQuickDays(draftStart, draftEnd),
    [draftStart, draftEnd],
  );

  const openSheet = () => {
    const seed = rangeForPeriod(period, offset, customRange);
    setDraftStart(seed.start);
    setDraftEnd(seed.end);
    setStep('start');
    setMonthViewIso(seed.start);
    setOpen(true);
  };

  const applyQuickRange = (days: number) => {
    const start = quickRangeStart(days);
    const end = anchorIso();
    setDraftStart(start);
    setDraftEnd(end);
    setStep('end');
    setMonthViewIso(start);
  };

  const onCalendarSelect = (iso: string) => {
    setMonthViewIso(iso);
    if (step === 'start') {
      setDraftStart(iso);
      if (iso > draftEnd) setDraftEnd(iso);
      setStep('end');
      return;
    }

    setDraftEnd(iso);
    if (iso < draftStart) setDraftStart(iso);
  };

  const focusStart = () => {
    setStep('start');
    setMonthViewIso(draftStart);
  };

  const focusEnd = () => {
    setStep('end');
    setMonthViewIso(draftEnd);
  };

  const applyCustom = () => {
    const start = draftStart <= draftEnd ? draftStart : draftEnd;
    const end = draftStart <= draftEnd ? draftEnd : draftStart;
    onCustomRangeChange({ start, end });
    onPeriodChange('custom');
    onOffsetChange(0);
    setOpen(false);
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={openSheet}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed, webNoOutline]}
        accessibilityRole="button"
        accessibilityLabel={`Period ${label}. Change period.`}>
        <Text style={styles.range} numberOfLines={1}>
          {label}
        </Text>
        <Ionicons name="chevron-down" size={14} color={AppTheme.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheetOuter} onPress={(e) => e.stopPropagation()}>
            <LiquidGlass
              style={styles.sheetGlass}
              intensity={72}
              washColor="#ffffff"
              contentStyle={styles.sheet}>
              <SheetGrabHandle onDismiss={() => setOpen(false)} />
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}>
                <View style={styles.sheetHeader}>
                  <View style={styles.sheetHeaderCopy}>
                    <Text style={styles.sheetTitle}>Date range</Text>
                    <Text style={styles.sheetSub}>Pick when you want to see insights for</Text>
                  </View>
                  <CloseIconButton onPress={() => setOpen(false)} />
                </View>

                <View style={styles.customBlock}>
                  <View style={styles.summaryCard}>
                    <Pressable
                      onPress={focusStart}
                      style={({ pressed }) => [
                        styles.summaryDate,
                        pressed && styles.pressed,
                        webNoOutline,
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: step === 'start' }}
                      accessibilityLabel={`Start date, ${formatCompact(draftStart)}`}>
                      <Text style={styles.summaryLabel}>From</Text>
                      <AnimatedSummaryDate iso={draftStart} active={step === 'start'} />
                    </Pressable>
                    <View style={styles.summaryArrow}>
                      <Ionicons name="arrow-forward" size={18} color={AppTheme.textFaint} />
                    </View>
                    <Pressable
                      onPress={focusEnd}
                      style={({ pressed }) => [
                        styles.summaryDate,
                        styles.summaryDateEnd,
                        pressed && styles.pressed,
                        webNoOutline,
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: step === 'end' }}
                      accessibilityLabel={`End date, ${formatCompact(draftEnd)}`}>
                      <Text style={styles.summaryLabel}>To</Text>
                      <AnimatedSummaryDate iso={draftEnd} active={step === 'end'} align="right" />
                    </Pressable>
                  </View>

                  <QuickRangeSegment
                    selectedDays={selectedQuickDays}
                    onSelect={applyQuickRange}
                  />

                  <InlineDateCalendar
                    valueIso={step === 'start' ? draftStart : draftEnd}
                    focusMonthIso={monthViewIso}
                    onSelect={onCalendarSelect}
                    minimumIso={step === 'end' ? draftStart : MIN_ISO}
                    maximumIso={step === 'start' ? draftEnd : MAX_ISO}
                    rangeStartIso={draftStart}
                    rangeEndIso={draftEnd}
                  />
                </View>
              </ScrollView>
            </LiquidGlass>

            <View style={[styles.sheetFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <GlassPressable
                label="Apply this range"
                onPress={applyCustom}
                size="md"
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: AppTheme.edgePadH,
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingRight: 8,
    borderRadius: 16,
    maxWidth: '100%',
  },
  range: {
    color: AppTheme.text,
    fontSize: 14,
    fontFamily: FontFamily.medium,
    letterSpacing: -0.2,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheetOuter: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    maxHeight: '78%',
    backgroundColor: '#fff',
  },
  sheetGlass: {
    overflow: 'hidden',
  },
  sheet: {
    paddingHorizontal: AppTheme.edgePadH,
    paddingTop: 8,
    paddingBottom: 6,
    maxHeight: '100%',
  },
  scrollContent: {
    paddingBottom: 4,
    paddingTop: 4,
  },
  sheetFooter: {
    paddingHorizontal: AppTheme.edgePadH,
    paddingTop: 8,
    backgroundColor: '#fff',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  sheetHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  sheetTitle: {
    color: AppTheme.text,
    fontSize: 17,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.3,
  },
  sheetSub: {
    color: AppTheme.textMuted,
    fontSize: 13,
    fontFamily: FontFamily.regular,
    lineHeight: 18,
  },
  customBlock: {
    gap: 10,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppTheme.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  summaryDate: { flex: 1, gap: 4, paddingVertical: 2 },
  summaryDateEnd: { alignItems: 'flex-end' },
  summaryArrow: { paddingHorizontal: 8 },
  summaryLabel: {
    color: AppTheme.textMuted,
    fontSize: 11,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.25,
  },
  summaryValueWrap: {
    minHeight: 22,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  summaryValueWrapEnd: {
    alignItems: 'flex-end',
  },
  quickTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppTheme.border,
    backgroundColor: '#fff',
    padding: TRACK_PADDING,
  },
  quickPeel: {
    position: 'absolute',
    left: 0,
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    borderRadius: 999,
    backgroundColor: AppTheme.accent,
  },
  quickChip: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  quickChipPressed: {
    opacity: 0.75,
  },
  quickChipText: {
    fontSize: 12,
    fontFamily: FontFamily.semibold,
    textAlign: 'center',
  },
  pressed: { opacity: 0.7 },
});
