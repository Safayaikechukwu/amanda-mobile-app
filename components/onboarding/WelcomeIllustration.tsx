import { Image, StyleSheet, View } from 'react-native';

import { Theme } from '@/constants/Theme';

const HERO_MARK = 108;

/** Large centered Udara mark — occupies the Family hero character slot */
export function WelcomeHeroMark() {
  const radius = HERO_MARK * Theme.radius.logo;

  return (
    <View style={styles.wrap}>
      <View style={[styles.markWrap, { width: HERO_MARK, height: HERO_MARK, borderRadius: radius }]}>
        <Image
          source={require('../../assets/images/udara-mark.png')}
          style={styles.mark}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markWrap: {
    overflow: 'hidden',
    backgroundColor: Theme.color.cta,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  mark: {
    width: HERO_MARK,
    height: HERO_MARK,
    transform: [{ scale: 1.08 }],
  },
});
