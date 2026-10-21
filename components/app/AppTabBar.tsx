import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ColorValue,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';

export const APP_TAB_BAR_STYLE = {
  backgroundColor: AppTheme.bg,
  borderTopWidth: StyleSheet.hairlineWidth,
  borderTopColor: AppTheme.border,
  elevation: 0,
  shadowOpacity: 0,
  paddingTop: 6,
  paddingBottom: Platform.OS === 'ios' ? 2 : 0,
  height: Platform.OS === 'ios' ? 88 : 64,
};

export const TAB_ICONS = {
  insights: { outline: 'pie-chart-outline' as const, filled: 'pie-chart' as const },
  savings: { outline: 'wallet-outline' as const, filled: 'wallet' as const },
};

export function tabIcon(name: string, color: ColorValue, size: number, focused = false) {
  const icons = TAB_ICONS[name as keyof typeof TAB_ICONS];
  if (!icons) return null;
  return <Ionicons name={focused ? icons.filled : icons.outline} size={size} color={color} />;
}

export function tabBarLabel({
  focused,
  color,
  children,
}: {
  focused: boolean;
  color: string;
  children: string;
}) {
  return (
    <Text
      style={[
        styles.tabLabel,
        { color },
        focused && styles.tabLabelActive,
      ]}
      numberOfLines={1}>
      {children}
    </Text>
  );
}

type TabBarButtonProps = {
  accessibilityState?: { selected?: boolean };
  children: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
};

export function AppTabBarButton({
  accessibilityState,
  children,
  onPress,
  style,
}: TabBarButtonProps) {
  const focused = accessibilityState?.selected ?? false;

  return (
    <Pressable
      accessibilityState={accessibilityState}
      onPress={onPress}
      style={[style, styles.tabBtn, Platform.OS === 'web' && styles.tabBtnWeb]}
      android_ripple={{ color: 'rgba(74, 5, 8, 0.08)', borderless: false }}>
      <View style={[styles.tabInner, focused && styles.tabInnerActive]}>{children}</View>
    </Pressable>
  );
}

/** @deprecated use TAB_BAR_SCROLL_INSET from app/(app)/_layout inline export */
export const TAB_BAR_SCROLL_INSET = 16;

const styles = StyleSheet.create({
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnWeb: {
    outlineStyle: 'none',
  } as object,
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 2,
  },
  tabInnerActive: {
    backgroundColor: 'rgba(74, 5, 8, 0.1)',
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: FontFamily.medium,
    marginTop: 1,
  },
  tabLabelActive: {
    fontFamily: FontFamily.bold,
    fontSize: 11.5,
  },
});
