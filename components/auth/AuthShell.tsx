import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Theme } from '@/constants/Theme';

type Props = {
  children: ReactNode;
  header?: ReactNode;
};

/** Full-screen auth canvas — no modal/sheet */
export function AuthShell({ children, header }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top + 8,
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}>
      {header}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.color.bg,
  },
  body: {
    flex: 1,
    paddingHorizontal: Theme.spacing.screenX,
  },
});
