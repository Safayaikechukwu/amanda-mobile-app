import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillButton } from '@/components/onboarding/PillButton';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { AuthRoutes } from '@/constants/AuthRoutes';
import { AppTheme } from '@/constants/AppTheme';
import { Copy } from '@/constants/Copy';
import { FontFamily } from '@/constants/Fonts';
import { Theme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { canUseBiometrics } from '@/helpers/localAuth';

function firstName(full: string | null | undefined): string {
  if (!full?.trim()) return 'there';
  return full.trim().split(/\s+/)[0] ?? 'there';
}

export default function ReturningPasskeyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signInWithPasskey, switchAccount, isUnlocked, isLoading, error, clearError } = useAuth();
  const autoAttempted = useRef(false);

  const goToApp = useCallback(() => {
    router.replace({ pathname: '/(app)', params: { focusComposer: '1' } });
  }, [router]);

  useEffect(() => {
    if (isUnlocked) goToApp();
  }, [isUnlocked, goToApp]);

  const tryPasskey = useCallback(async () => {
    clearError();
    const ok = await signInWithPasskey();
    if (ok) goToApp();
  }, [signInWithPasskey, goToApp, clearError]);

  useEffect(() => {
    if (autoAttempted.current) return;
    canUseBiometrics().then((available) => {
      if (!available) return;
      autoAttempted.current = true;
      setTimeout(() => void tryPasskey(), 450);
    });
  }, [tryPasskey]);

  const onSwitchAccount = async () => {
    await switchAccount();
    router.replace(AuthRoutes.signIn);
  };

  const displayName = user?.name ?? 'Ikechukwu Ndubueze';

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <StatusBar style="dark" />

      <View style={styles.center}>
        <ProfileAvatar name={displayName} size="lg" />
        <Text style={styles.greeting}>
          {Copy.passkeySignIn.greeting.replace('{name}', firstName(displayName))}
        </Text>
        {isLoading ? (
          <View style={styles.verifying}>
            <ActivityIndicator color={AppTheme.accent} />
            <Text style={styles.hint}>{Copy.passkeySignIn.verifying}</Text>
          </View>
        ) : (
          <Text style={styles.hint}>{Copy.passkeySignIn.hint}</Text>
        )}
      </View>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PillButton
          label={Copy.passkeySignIn.cta}
          onPress={() => void tryPasskey()}
          loading={isLoading}
        />
        <Pressable onPress={() => void onSwitchAccount()} style={styles.logoutWrap} accessibilityRole="button">
          <Text style={styles.logout}>
            {Copy.passkeySignIn.switchAccountPrefix}
            <Text style={styles.logoutLink}>{Copy.passkeySignIn.switchAccountLink}</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppTheme.bg,
    paddingHorizontal: Theme.spacing.auth.horizontal,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 48,
  },
  greeting: {
    marginTop: 16,
    color: AppTheme.text,
    fontSize: 28,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  hint: {
    color: AppTheme.textMuted,
    fontSize: 15,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  verifying: {
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  footer: {
    gap: 14,
    paddingBottom: 4,
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
    fontFamily: FontFamily.medium,
    textAlign: 'center',
  },
  logoutWrap: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  logout: {
    color: AppTheme.textFaint,
    fontSize: 13,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
  },
  logoutLink: {
    color: AppTheme.accent,
    textDecorationLine: 'underline',
    fontFamily: FontFamily.medium,
  },
});
