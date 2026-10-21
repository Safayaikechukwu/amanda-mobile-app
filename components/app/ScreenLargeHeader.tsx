import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  /** Back button or other control above the title, left-aligned. */
  leading?: ReactNode;
};

/** iOS-style large title row for tab destinations. */
export function ScreenLargeHeader({ title, subtitle, right, leading }: Props) {
  return (
    <View style={[styles.wrap, leading ? styles.wrapWithLeading : undefined]}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: AppTheme.edgePadH,
    paddingTop: 10,
    paddingBottom: 16,
  },
  wrapWithLeading: {
    paddingTop: 4,
  },
  leading: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  right: {
    paddingTop: 6,
  },
  title: {
    color: AppTheme.accent,
    fontSize: 34,
    lineHeight: 38,
    fontFamily: FontFamily.bold,
    letterSpacing: -1.1,
  },
  subtitle: {
    color: AppTheme.textMuted,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: FontFamily.medium,
    letterSpacing: -0.2,
  },
});
