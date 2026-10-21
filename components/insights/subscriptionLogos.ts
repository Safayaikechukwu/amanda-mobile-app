import type { ImageSourcePropType } from 'react-native';

/**
 * Register downloaded logos here.
 *
 * 1. Save PNGs to `assets/images/subs/{logoKey}.png` (square, ~256px)
 * 2. Add: `dstv: require('../../assets/images/subs/dstv.png'),`
 *
 * Until then, rows use a colored letter mark.
 */
export const SUBSCRIPTION_LOGOS: Partial<Record<string, ImageSourcePropType>> = {
  piggyvest: require('../../assets/images/piggyvest-logo.png'),
  // Example once you add the file:
  // dstv: require('../../assets/images/subs/dstv.png'),
  // netflix: require('../../assets/images/subs/netflix.png'),
  // spotify: require('../../assets/images/subs/spotify.png'),
};
