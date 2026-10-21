import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { AppTheme } from '@/constants/AppTheme';

const TRACK_WIDTH = 51;
const TRACK_HEIGHT = 31;
const THUMB_SIZE = 27;
const TRACK_PADDING = 2;
const THUMB_TRAVEL = TRACK_WIDTH - TRACK_PADDING * 2 - THUMB_SIZE;

const TRACK_OFF = '#E5E5EA';
const TRACK_ON = AppTheme.accent;

const TOGGLE_SPRING = {
  damping: 22,
  stiffness: 320,
  mass: 0.55,
};

const PRESS_SPRING = {
  damping: 18,
  stiffness: 420,
  mass: 0.4,
};

type Props = {
  value: boolean;
  onValueChange: (next: boolean) => void;
  accessibilityLabel?: string;
};

export function Toggle({ value, onValueChange, accessibilityLabel }: Props) {
  const progress = useSharedValue(value ? 1 : 0);
  const pressed = useSharedValue(0);
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      progress.value = value ? 1 : 0;
      return;
    }

    progress.value = withSpring(value ? 1 : 0, TOGGLE_SPRING);
  }, [progress, value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [TRACK_OFF, TRACK_ON]),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [0, THUMB_TRAVEL]) },
      { scale: interpolate(pressed.value, [0, 1], [1, 0.94]) },
    ],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => onValueChange(!value)}
      onPressIn={() => {
        pressed.value = withSpring(1, PRESS_SPRING);
      }}
      onPressOut={() => {
        pressed.value = withSpring(0, PRESS_SPRING);
      }}
      hitSlop={6}>
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: TRACK_PADDING,
    justifyContent: 'center',
    flexShrink: 0,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: '#0d0d0d',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 3,
      },
      android: { elevation: 3 },
      default: {
        boxShadow: '0 1px 4px rgba(13,13,13,0.22)',
      },
    }),
  },
});
