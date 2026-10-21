import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingBackButton } from '@/components/onboarding/OnboardingBackButton';
import { PillButton } from '@/components/onboarding/PillButton';
import { Text } from '@/components/ui/Text';
import { Copy } from '@/constants/Copy';
import { FontFamily } from '@/constants/Fonts';
import { Theme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { canUseBiometrics } from '@/helpers/localAuth';

export default function PasskeySetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { registerPasskey, isLoading, error, clearError, isUnlocked } = useAuth();
  const autoAttempted = useRef(false);

  const goToApp = useCallback(() => {
    router.replace({ pathname: '/(app)', params: { focusComposer: '1' } });
  }, [router]);

  useEffect(() => {
    if (isUnlocked) goToApp();
  }, [isUnlocked, goToApp]);

  const onEnable = useCallback(async () => {
    clearError();
    await registerPasskey();
  }, [registerPasskey, clearError]);

  useEffect(() => {
    if (autoAttempted.current) return;
    autoAttempted.current = true;
    canUseBiometrics().then((available) => {
      if (available) {
        setTimeout(() => void onEnable(), 500);
      }
    });
  }, [onEnable]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 24) }]}>
      <StatusBar style="dark" />

      <View style={styles.nav}>
        <OnboardingBackButton />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{Copy.passkey.title}</Text>
        <Text style={styles.subtitle}>{Copy.passkey.subtext}</Text>

        <View style={styles.visual}>
          <Ionicons name="key" size={48} color={Theme.color.cta} />
        </View>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        <PillButton
          label={Copy.passkey.create}
          onPress={() => void onEnable()}
          disabled={isLoading}
          loading={isLoading}
        />

        <Pressable
          onPress={() => void onEnable()}
          disabled={isLoading}
          style={styles.skipWrap}
          accessibilityRole="button">
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
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
  nav: {
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: 8,
  },
  body: {
    flex: 1,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    fontFamily: FontFamily.bold,
    color: Theme.color.ink,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: FontFamily.regular,
    color: Theme.color.muted,
    marginBottom: 40,
    maxWidth: 340,
  },
  visual: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 320,
    aspectRatio: 1.2,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
    fontFamily: FontFamily.medium,
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    gap: 8,
    paddingBottom: 8,
  },
  skipWrap: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  skipText: {
    color: Theme.color.cta,
    fontSize: 15,
    fontFamily: FontFamily.medium,
  },
});
