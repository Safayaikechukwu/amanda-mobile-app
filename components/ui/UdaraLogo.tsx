import { Image, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { Theme } from '@/constants/Theme';

type Props = {
  size?: 'md' | 'lg';
  showWordmark?: boolean;
  /** light = white wordmark on dark surfaces; dark = ink on white auth screens */
  tone?: 'light' | 'dark';
};

export function UdaraLogo({ size = 'lg', showWordmark = true, tone = 'light' }: Props) {
  const markSize = size === 'lg' ? 88 : 56;
  const radius = markSize * Theme.radius.logo;

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.markWrap,
          { height: markSize, width: markSize, borderRadius: radius },
          !showWordmark && styles.markWrapSolo,
        ]}>
        <Image
          source={require('../../assets/images/udara-mark.png')}
          style={{ height: markSize, width: markSize, transform: [{ scale: 1.08 }] }}
          resizeMode="cover"
        />
      </View>
      {showWordmark ? (
        <Text variant="logo" inverted={tone === 'light'} style={styles.wordmark}>
          Udara
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  markWrap: {
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: Theme.color.cta,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.color.surfaceDarkBorder,
  },
  markWrapSolo: {
    marginBottom: 0,
  },
  wordmark: {
    letterSpacing: -0.42,
  },
});
