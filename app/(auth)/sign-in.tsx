import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillButton } from '@/components/onboarding/PillButton';
import { UdaraLogo } from '@/components/ui/UdaraLogo';
import { AuthRoutes } from '@/constants/AuthRoutes';
import { Copy } from '@/constants/Copy';
import { FontFamily } from '@/constants/Fonts';
import { Theme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';

const emailOk = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signInWithEmail, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');

  const canContinue = emailOk(email);

  const onContinue = async () => {
    if (!canContinue) return;
    clearError();
    const ok = await signInWithEmail(email.trim());
    if (ok) router.replace(AuthRoutes.passkey);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />

      <View style={[styles.safe, { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.header}>
          <UdaraLogo size="md" tone="dark" showWordmark={false} />
          <Text style={styles.title}>{Copy.signIn.title}</Text>
          <Text style={styles.subtitle}>{Copy.signIn.subtitle}</Text>
        </View>

        <View style={styles.field}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={Copy.signIn.placeholder}
            placeholderTextColor={Theme.color.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="go"
            onSubmitEditing={() => void onContinue()}
            style={styles.input}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.spacer} />

        <PillButton label={Copy.signIn.continue} onPress={() => void onContinue()} disabled={!canContinue} loading={isLoading} />

        <Pressable
          onPress={() => router.push(AuthRoutes.join)}
          style={styles.switchWrap}
          accessibilityRole="button">
          <Text style={styles.switchText}>
            {Copy.signIn.newUser}{' '}
            <Text style={styles.switchLink}>{Copy.signIn.createAccount}</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.color.bg,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 28,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
    fontFamily: FontFamily.bold,
    color: Theme.color.ink,
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FontFamily.regular,
    color: Theme.color.muted,
    textAlign: 'center',
    maxWidth: 280,
  },
  field: {
    backgroundColor: Theme.color.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    minHeight: 50,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: FontFamily.regular,
    color: Theme.color.ink,
    paddingVertical: 12,
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
    fontFamily: FontFamily.medium,
    textAlign: 'center',
    marginTop: 12,
  },
  spacer: { flex: 1, minHeight: 16 },
  switchWrap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchText: {
    color: Theme.color.muted,
    fontSize: 15,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
  },
  switchLink: {
    color: Theme.color.cta,
    fontFamily: FontFamily.semibold,
  },
});
