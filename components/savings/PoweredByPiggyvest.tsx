import { Image, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';

const LOGO = require('../../assets/images/piggyvest-logo.png');
const LOGO_ASPECT = 515 / 388;
const LOGO_HEIGHT = 56;

/** Partner attribution — shown on all savings bucket screens. */
export function PoweredByPiggyvest() {
  return (
    <View style={styles.wrap} accessibilityRole="text" accessibilityLabel="Powered by PiggyVest">
      <Text style={styles.label}>Powered by </Text>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" accessibilityIgnoresInvertColors />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginTop: 8,
  },
  label: {
    color: AppTheme.textFaint,
    fontSize: 12,
    fontFamily: FontFamily.regular,
  },
  logo: {
    height: LOGO_HEIGHT,
    width: LOGO_HEIGHT * LOGO_ASPECT,
  },
});
