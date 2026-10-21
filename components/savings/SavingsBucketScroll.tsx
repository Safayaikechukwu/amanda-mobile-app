import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PoweredByPiggyvest } from '@/components/savings/PoweredByPiggyvest';
import { BUCKET_LAYOUT } from '@/components/savings/bucketStyles';
import { AppTheme } from '@/constants/AppTheme';

const NAV_HEIGHT = 52;

type Props = {
  children: ReactNode;
  footer?: ReactNode;
};

/** Shared bucket scroll — consistent padding and footer pinned when content is short. */
export function SavingsBucketScroll({ children, footer }: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const minContentHeight = windowHeight - insets.top - NAV_HEIGHT - insets.bottom;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { minHeight: minContentHeight, paddingBottom: Math.max(insets.bottom, 16) + 8 },
      ]}
      showsVerticalScrollIndicator={false}
      bounces={false}>
      <View style={styles.body}>{children}</View>
      <View style={styles.footer}>{footer ?? <PoweredByPiggyvest />}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: AppTheme.edgePadH,
    paddingTop: BUCKET_LAYOUT.scrollTopPad,
    justifyContent: 'space-between',
  },
  body: {
    gap: BUCKET_LAYOUT.sectionGap,
    paddingBottom: 12,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
});
