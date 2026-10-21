import { StatusBar } from 'expo-status-bar';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { ScreenLargeHeader } from '@/components/app/ScreenLargeHeader';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';

type HeaderVariant = 'standard' | 'large' | 'settings';

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  left?: ReactNode;
  /** Default center. Use left when a trailing header action is needed (e.g. Insights). */
  titleAlign?: 'left' | 'center';
  /** `large` — bold Apple-style title for tab screens. */
  headerVariant?: HeaderVariant;
};

/** Simple screen chrome for tab destinations (no drawer). */
export function AppScreen({
  children,
  title,
  subtitle,
  right,
  left,
  titleAlign = 'center',
  headerVariant = 'standard',
}: Props) {
  const insets = useSafeAreaInsets();
  const leftAligned = titleAlign === 'left';
  const largeHeader = headerVariant === 'large';
  const settingsHeader = headerVariant === 'settings';

  return (
    <View style={[styles.root, { paddingTop: insets.top + (largeHeader ? 10 : 6) }]}>
      <StatusBar style="dark" />
      {largeHeader && title ? (
        <ScreenLargeHeader title={title} subtitle={subtitle} right={right} />
      ) : null}
      {!largeHeader && (title || right || left) ? (
        <View style={[styles.header, settingsHeader && styles.headerSettings]}>
          {left ? <View style={[styles.side, settingsHeader && styles.sideSettings]}>{left}</View> : null}
          <View
            style={[
              styles.titleBlock,
              leftAligned ? styles.titleBlockLeft : styles.titleBlockCenter,
            ]}>
            {title ? (
              <Text
                style={[
                  styles.title,
                  settingsHeader && styles.titleSettings,
                  leftAligned && styles.titleLeft,
                ]}
                numberOfLines={1}>
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text
                style={[styles.subtitle, leftAligned && styles.titleLeft]}
                numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          <View style={[styles.sideRight, !right && !leftAligned && styles.side]}>
            {right}
          </View>
        </View>
      ) : null}
      <View style={[styles.body, settingsHeader && styles.bodySettings]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppTheme.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
    minHeight: 44,
    gap: 8,
  },
  headerSettings: {
    paddingBottom: 14,
    minHeight: 44,
  },
  side: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideSettings: {
    width: 40,
  },
  sideRight: {
    minWidth: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  titleBlockCenter: {
    alignItems: 'center',
  },
  titleBlockLeft: {
    alignItems: 'flex-start',
  },
  title: {
    color: AppTheme.text,
    fontSize: 20,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.4,
  },
  titleSettings: {
    fontSize: 17,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.2,
  },
  titleLeft: {
    textAlign: 'left',
  },
  subtitle: {
    color: AppTheme.textMuted,
    fontSize: 13,
    fontFamily: FontFamily.regular,
    marginTop: 2,
  },
  body: { flex: 1 },
  bodySettings: {
    paddingTop: 12,
  },
});
