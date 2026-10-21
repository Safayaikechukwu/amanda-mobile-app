import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_EASE = Easing.bezier(0.22, 1, 0.36, 1);
const CELL_SIZE = 34;

function parseIso(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

export function isoToDate(iso: string): Date {
  return parseIso(iso);
}

export function dateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type Props = {
  /** Currently focused date in the calendar. */
  valueIso: string;
  /** Jump the visible month when this date changes. */
  focusMonthIso?: string;
  onSelect: (iso: string) => void;
  minimumIso?: string;
  maximumIso?: string;
  /** Optional range highlight between start and end. */
  rangeStartIso?: string;
  rangeEndIso?: string;
};

export function InlineDateCalendar({
  valueIso,
  focusMonthIso,
  onSelect,
  minimumIso,
  maximumIso,
  rangeStartIso,
  rangeEndIso,
}: Props) {
  const value = parseIso(valueIso);
  const monthSeed = focusMonthIso ?? valueIso;
  const [viewMonth, setViewMonth] = useState(
    () => new Date(parseIso(monthSeed).getFullYear(), parseIso(monthSeed).getMonth(), 1),
  );
  const viewMonthRef = useRef(viewMonth);
  viewMonthRef.current = viewMonth;
  const gridOpacity = useSharedValue(1);

  const animateMonthChange = (next: Date) => {
    const current = viewMonthRef.current;
    if (
      current.getFullYear() === next.getFullYear() &&
      current.getMonth() === next.getMonth()
    ) {
      return;
    }

    gridOpacity.value = withTiming(0.35, { duration: 120, easing: MONTH_EASE }, (finished) => {
      if (!finished) return;
      runOnJS(setViewMonth)(next);
      gridOpacity.value = withTiming(1, { duration: 220, easing: MONTH_EASE });
    });
  };

  useEffect(() => {
    const d = parseIso(focusMonthIso ?? valueIso);
    animateMonthChange(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [focusMonthIso, valueIso]);

  const gridStyle = useAnimatedStyle(() => ({
    opacity: gridOpacity.value,
  }));

  const min = minimumIso ? parseIso(minimumIso) : null;
  const max = maximumIso ? parseIso(maximumIso) : null;
  const rangeStart = rangeStartIso ? parseIso(rangeStartIso) : null;
  const rangeEnd = rangeEndIso ? parseIso(rangeEndIso) : null;

  const rangeLow =
    rangeStart && rangeEnd
      ? rangeStart <= rangeEnd
        ? rangeStart
        : rangeEnd
      : null;
  const rangeHigh =
    rangeStart && rangeEnd
      ? rangeStart <= rangeEnd
        ? rangeEnd
        : rangeStart
      : null;

  const cells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    let pad = new Date(year, month, 1).getDay() - 1;
    if (pad < 0) pad = 6;

    const days: (Date | null)[] = Array.from({ length: pad }, () => null);
    for (let day = 1; day <= lastDay; day += 1) {
      days.push(new Date(year, month, day, 12, 0, 0));
    }
    return days;
  }, [viewMonth]);

  const monthLabel = viewMonth.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
  const monthKey = `${viewMonth.getFullYear()}-${viewMonth.getMonth()}`;

  const monthStart = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const canPrev = !min || monthStart > new Date(min.getFullYear(), min.getMonth(), 1);
  const canNext =
    !max || monthStart < new Date(max.getFullYear(), max.getMonth(), 1);

  const isDisabled = (date: Date) => {
    if (min && date < min) return true;
    if (max && date > max) return true;
    return false;
  };

  const inRange = (date: Date) => {
    if (!rangeLow || !rangeHigh) return false;
    return date >= rangeLow && date <= rangeHigh;
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable
          onPress={() =>
            canPrev &&
            animateMonthChange(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
          }
          disabled={!canPrev}
          style={({ pressed }) => [styles.navBtn, pressed && canPrev && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Previous month">
          <Ionicons
            name="chevron-back"
            size={18}
            color={canPrev ? AppTheme.text : AppTheme.textFaint}
          />
        </Pressable>
        <Animated.Text
          key={monthKey}
          entering={FadeIn.duration(200).easing(MONTH_EASE)}
          exiting={FadeOut.duration(150).easing(MONTH_EASE)}
          style={styles.month}>
          {monthLabel}
        </Animated.Text>
        <Pressable
          onPress={() =>
            canNext &&
            animateMonthChange(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
          }
          disabled={!canNext}
          style={({ pressed }) => [styles.navBtn, pressed && canNext && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Next month">
          <Ionicons
            name="chevron-forward"
            size={18}
            color={canNext ? AppTheme.text : AppTheme.textFaint}
          />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((label) => (
          <Text key={label} style={styles.weekday}>
            {label}
          </Text>
        ))}
      </View>

      <Animated.View style={[styles.grid, gridStyle]}>
        {cells.map((date, index) => {
          if (!date) {
            return <View key={`empty-${index}`} style={styles.cell} />;
          }

          const disabled = isDisabled(date);
          const focused = sameDay(date, value);
          const isRangeStart = rangeLow != null && sameDay(date, rangeLow);
          const isRangeEnd = rangeHigh != null && sameDay(date, rangeHigh);
          const isEndpoint = isRangeStart || isRangeEnd;
          const ranged = inRange(date);
          const iso = dateToIso(date);

          return (
            <Pressable
              key={iso}
              disabled={disabled}
              onPress={() => onSelect(iso)}
              style={({ pressed }) => [
                styles.cell,
                ranged && !isEndpoint && styles.cellInRange,
                isEndpoint && !focused && styles.cellEndpoint,
                focused && styles.cellFocused,
                disabled && styles.cellDisabled,
                pressed && !disabled && styles.cellPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={date.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              accessibilityState={{ selected: focused, disabled }}>
              <Text
                style={[
                  styles.dayText,
                  ranged && !focused && !isEndpoint && styles.dayInRange,
                  isEndpoint && !focused && styles.dayEndpoint,
                  focused && styles.dayFocused,
                  disabled && styles.dayDisabled,
                ]}>
                {date.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppTheme.border,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: {
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.2,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekday: {
    width: `${100 / 7}%` as const,
    textAlign: 'center',
    color: AppTheme.textFaint,
    fontSize: 10,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%` as const,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  cellInRange: {
    backgroundColor: 'rgba(74, 5, 8, 0.06)',
    borderRadius: 0,
  },
  cellEndpoint: {
    backgroundColor: 'rgba(74, 5, 8, 0.14)',
  },
  cellFocused: {
    backgroundColor: AppTheme.accent,
  },
  cellDisabled: {
    opacity: 0.35,
  },
  cellPressed: {
    opacity: 0.85,
  },
  dayText: {
    color: AppTheme.text,
    fontSize: 14,
    fontFamily: FontFamily.medium,
  },
  dayInRange: {
    color: AppTheme.accent,
    fontFamily: FontFamily.medium,
  },
  dayEndpoint: {
    color: AppTheme.accent,
    fontFamily: FontFamily.bold,
  },
  dayFocused: {
    color: '#fff',
    fontFamily: FontFamily.bold,
  },
  dayDisabled: {
    color: AppTheme.textFaint,
  },
  pressed: { opacity: 0.7 },
});
