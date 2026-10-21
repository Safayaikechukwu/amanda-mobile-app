import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, type TextStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';

export type AmountInputSource = 'keypad' | 'chip';

type Props = {
  raw: string;
  hasAmount: boolean;
  /** When `chip`, the amount swaps instantly — no per-digit roll. */
  inputSource?: AmountInputSource;
  style?: TextStyle;
  emptyStyle?: TextStyle;
};

type Motion = 'enter' | 'exit' | 'none';

type DisplayToken = {
  char: string;
  key: string;
  motion: Motion;
  isSeparator: boolean;
};

const DIGIT_HEIGHT = 58;
const EXIT_MS = 280;

/** Soft, weighted spring — no snappy bounce. */
const ROLL_SPRING = {
  damping: 26,
  stiffness: 170,
  mass: 0.9,
};

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

function formatRaw(raw: string): string {
  if (raw === '0' || raw === '') return '0';

  if (raw.endsWith('.')) {
    const whole = raw.slice(0, -1);
    const formatted = Number(whole || 0).toLocaleString('en-NG');
    return `${formatted}.`;
  }

  if (raw.includes('.')) {
    const [whole, frac = ''] = raw.split('.');
    const head = Number(whole || 0).toLocaleString('en-NG');
    return frac.length > 0 ? `${head}.${frac}` : `${head}.`;
  }

  return Number(raw || 0).toLocaleString('en-NG');
}

function tokenize(formatted: string, motionAtDigitIndex: number | null, motion: Motion): DisplayToken[] {
  let digitIndex = -1;
  return formatted.split('').map((char) => {
    const isSeparator = char === ',' || char === '.';
    if (!isSeparator) digitIndex += 1;
    const activeMotion =
      !isSeparator && motionAtDigitIndex != null && digitIndex === motionAtDigitIndex ? motion : 'none';
    return {
      char,
      key: isSeparator ? `sep-${digitIndex}-${char}` : `d-${digitIndex}`,
      motion: activeMotion,
      isSeparator,
    };
  });
}

function lastDigitIndex(formatted: string): number {
  let index = -1;
  for (const char of formatted) {
    if (char !== ',' && char !== '.') index += 1;
  }
  return index;
}

function DigitSlot({
  char,
  motion,
  color,
}: {
  char: string;
  motion: Motion;
  color: string;
}) {
  const progress = useSharedValue(motion === 'enter' ? 0 : 1);
  const direction = useSharedValue(motion === 'enter' ? 1 : motion === 'exit' ? -1 : 0);

  useEffect(() => {
    if (motion === 'enter') {
      direction.value = 1;
      progress.value = 0;
      progress.value = withSpring(1, ROLL_SPRING);
      return;
    }

    if (motion === 'exit') {
      direction.value = -1;
      progress.value = withTiming(0, { duration: EXIT_MS, easing: EASE_OUT });
      return;
    }

    direction.value = 0;
    progress.value = 1;
  }, [char, motion, direction, progress]);

  const slotStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const d = direction.value;

    if (d === 1) {
      return {
        transform: [
          { translateY: interpolate(p, [0, 1], [DIGIT_HEIGHT * 0.72, 0]) },
          { scale: interpolate(p, [0, 1], [0.92, 1]) },
        ],
        opacity: interpolate(p, [0, 0.35, 1], [0, 0.88, 1]),
      };
    }

    if (d === -1) {
      return {
        transform: [
          { translateY: interpolate(p, [0, 1], [-DIGIT_HEIGHT * 0.55, 0]) },
          { scale: interpolate(p, [0, 1], [0.94, 1]) },
        ],
        opacity: interpolate(p, [0, 0.45, 1], [0, 0.75, 1]),
      };
    }

    return {
      transform: [{ translateY: 0 }, { scale: 1 }],
      opacity: 1,
    };
  });

  return (
    <View style={styles.digitClip}>
      <Animated.Text style={[styles.digit, slotStyle, { color }]}>{char}</Animated.Text>
    </View>
  );
}

function SeparatorChar({ char, color }: { char: string; color: string }) {
  return <Text style={[styles.digit, styles.separator, { color }]}>{char}</Text>;
}

/** Only true when the keypad appended exactly one character. */
function isKeypadAppend(prev: string, next: string): boolean {
  if (next.length !== prev.length + 1) return false;
  if (prev === '0') return next !== '0' && next.length <= 2;
  return next.slice(0, -1) === prev;
}

/** Only true when the keypad removed exactly one character. */
function isKeypadBackspace(prev: string, next: string): boolean {
  if (next.length !== prev.length - 1) return false;
  if (next === '0' && prev.length === 1) return true;
  return prev.slice(0, -1) === next;
}

/** Only the added or removed digit rolls — everything else stays still. */
export function AnimatedAmountDisplay({
  raw,
  hasAmount,
  inputSource = 'keypad',
  style,
  emptyStyle,
}: Props) {
  const prevRawRef = useRef(raw);
  const [tokens, setTokens] = useState<DisplayToken[]>(() =>
    tokenize(formatRaw(raw), null, 'none'),
  );
  const tint = useSharedValue(hasAmount ? 1 : 0);
  const nudge = useSharedValue(1);

  useEffect(() => {
    tint.value = withTiming(hasAmount ? 1 : 0, { duration: 320, easing: EASE_OUT });
  }, [hasAmount, tint]);

  useEffect(() => {
    const prevRaw = prevRawRef.current;
    if (prevRaw === raw) return;

    const prevFormatted = formatRaw(prevRaw);
    const nextFormatted = formatRaw(raw);

    if (inputSource === 'chip') {
      setTokens(tokenize(nextFormatted, null, 'none'));
      prevRawRef.current = raw;
      return;
    }

    if (isKeypadAppend(prevRaw, raw)) {
      const motionIndex = lastDigitIndex(nextFormatted);
      setTokens(tokenize(nextFormatted, motionIndex, 'enter'));
      nudge.value = withSequence(
        withSpring(1.008, { damping: 28, stiffness: 140, mass: 1 }),
        withSpring(1, ROLL_SPRING),
      );
      prevRawRef.current = raw;
      return;
    }

    if (isKeypadBackspace(prevRaw, raw) && nextFormatted.length <= prevFormatted.length) {
      const motionIndex = lastDigitIndex(prevFormatted);
      setTokens(tokenize(prevFormatted, motionIndex, 'exit'));
      const timer = setTimeout(() => {
        setTokens(tokenize(nextFormatted, null, 'none'));
        prevRawRef.current = raw;
      }, EXIT_MS);
      return () => clearTimeout(timer);
    }

    setTokens(tokenize(nextFormatted, null, 'none'));
    prevRawRef.current = raw;
  }, [raw, inputSource, nudge]);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nudge.value }],
  }));

  const symbolStyle = useAnimatedStyle(() => ({
    color: interpolateColor(tint.value, [0, 1], [AppTheme.textFaint, AppTheme.text]),
  }));

  const digitColor = hasAmount ? AppTheme.text : AppTheme.textFaint;

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.row, rowStyle]}>
        <Animated.Text style={[styles.digit, styles.symbol, style, symbolStyle, !hasAmount && emptyStyle]}>
          ₦
        </Animated.Text>
        {tokens.map((token) =>
          token.isSeparator ? (
            <SeparatorChar key={token.key} char={token.char} color={digitColor} />
          ) : (
            <DigitSlot key={token.key} char={token.char} motion={token.motion} color={digitColor} />
          ),
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  digitClip: {
    height: DIGIT_HEIGHT,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  digit: {
    color: AppTheme.text,
    fontSize: 52,
    fontFamily: FontFamily.bold,
    letterSpacing: -1.5,
    lineHeight: DIGIT_HEIGHT,
    textAlign: 'center',
  },
  symbol: {
    marginRight: 1,
  },
  separator: {
    letterSpacing: -0.5,
  },
});
