import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { LiquidGlass } from '@/components/ui/LiquidGlass';

/** Subtle oxblood glass — avatar initials. */
const AVATAR_TINT = AppTheme.accent;

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    const token = parts[0];
    if (token.length >= 2 && token.length <= 3 && !token.includes('.')) {
      return token.slice(0, 2).toUpperCase();
    }
    return token.slice(0, 1).toUpperCase();
  }
  return parts
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const SIZES = {
  xs: { box: 26, font: 11, radius: 13, icon: 15 },
  sm: { box: 32, font: 12, radius: 16, icon: 18 },
  md: { box: 44, font: 15, radius: 22, icon: 24 },
  lg: { box: 80, font: 28, radius: 40, icon: 42 },
} as const;

type Props = {
  name: string;
  size?: keyof typeof SIZES;
  /** `mock` — demo user photo-style avatar for nav chrome. */
  variant?: 'initials' | 'mock';
  style?: StyleProp<ViewStyle>;
};

export function ProfileAvatar({ name, size = 'sm', variant = 'initials', style }: Props) {
  const dim = SIZES[size];

  if (variant === 'mock') {
    return (
      <View
        style={[
          styles.mockShell,
          {
            width: dim.box,
            height: dim.box,
            borderRadius: dim.radius,
          },
          style,
        ]}>
        <Ionicons name="person" size={dim.icon} color="rgba(255,255,255,0.96)" />
      </View>
    );
  }

  const initials = getInitials(name);

  return (
    <LiquidGlass
      style={[
        styles.avatarGlass,
        {
          width: dim.box,
          height: dim.box,
          borderRadius: dim.radius,
        },
        style,
      ]}
      surface="accent"
      tintColor={AVATAR_TINT}
      contentStyle={[styles.avatarInner, { borderRadius: dim.radius }]}>
      <Text style={[styles.text, { fontSize: dim.font }]}>{initials}</Text>
    </LiquidGlass>
  );
}

type NavButtonProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Chat header — profile avatar only (no label). */
export function ProfileNavButton({ onPress, style }: NavButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Profile"
      hitSlop={6}
      style={({ pressed }) => [styles.navHit, pressed && styles.navBtnPressed, style]}>
      <ProfileAvatar name="" variant="mock" size="xs" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatarGlass: {
    overflow: 'hidden',
  },
  avatarInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockShell: {
    backgroundColor: AppTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  text: {
    color: '#ffffff',
    fontFamily: FontFamily.bold,
    letterSpacing: 0.4,
  },
  navHit: {
    alignSelf: 'flex-end',
  },
  navBtnPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
});
