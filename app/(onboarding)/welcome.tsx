import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillButton } from '@/components/onboarding/PillButton';
import { WelcomeHeroMark } from '@/components/onboarding/WelcomeIllustration';
import { Copy } from '@/constants/Copy';
import { FontFamily } from '@/constants/Fonts';
import { Theme } from '@/constants/Theme';
import { openLink } from '@/helpers/openLink';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  // Logo band — balanced against headline + footer
  const heroHeight = Math.round(height * 0.34);

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 20),
        },
      ]}>
      <StatusBar style="dark" />

      {/* Hero band — logo centered like Family’s blue character */}
      <View style={[styles.hero, { height: heroHeight }]}>
        <WelcomeHeroMark />
      </View>

      {/* Copy sits below the hero band */}
      <View style={styles.copy}>
        <Text style={styles.headline}>
          {Copy.welcome.headlineLine1}
          {'\n'}
          {Copy.welcome.headlineLine2}
        </Text>
      </View>

      <View style={styles.spacer} />

      <View style={styles.footer}>
        <PillButton label={Copy.welcome.primaryCta} onPress={() => router.push('/(onboarding)/email')} />
        <Text style={styles.legal}>
          {Copy.welcome.legalPrefix}
          <Text style={styles.legalLink} onPress={() => void openLink(Theme.link.terms)}>
            {Copy.welcome.termsLabel}
          </Text>
          {Copy.welcome.legalJoin}
          <Text style={styles.legalLink} onPress={() => void openLink(Theme.link.privacy)}>
            {Copy.welcome.privacyLabel}
          </Text>
          .
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.color.bg,
    paddingHorizontal: Theme.spacing.auth.horizontal,
  },
  hero: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  headline: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.45,
    fontFamily: FontFamily.bold,
    color: Theme.color.ink,
    textAlign: 'center',
    maxWidth: 300,
  },
  spacer: {
    flex: 1,
    minHeight: 12,
  },
  footer: {
    gap: 10,
    paddingBottom: 4,
  },
  legal: {
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 14,
    color: '#9ca3af',
    fontFamily: FontFamily.regular,
    paddingHorizontal: 12,
  },
  legalLink: {
    color: '#9ca3af',
    textDecorationLine: 'underline',
    fontFamily: FontFamily.regular,
    fontSize: 10,
    lineHeight: 14,
  },
});
