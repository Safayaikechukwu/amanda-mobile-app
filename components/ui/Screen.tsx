import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { Theme } from '@/constants/Theme';

type Props = {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
  center?: ReactNode;
};

export function Screen({ title, subtitle, children, footer, center }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top + 24,
          paddingBottom: Math.max(insets.bottom, 20) + 8,
        },
      ]}>
      {center ? <View style={styles.center}>{center}</View> : null}
      {(title || subtitle) && (
        <View style={styles.header}>
          {title ? (
            <Text variant="title" inverted>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text variant="subtitle" inverted muted style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      )}
      <View style={styles.body}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: Theme.spacing.screenX },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 48,
  },
  header: { marginBottom: 28 },
  subtitle: { marginTop: 8 },
  body: { flex: 1, justifyContent: 'flex-end' },
  footer: { marginTop: 16 },
});
