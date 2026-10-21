import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingBackButton } from '@/components/onboarding/OnboardingBackButton';
import { PillButton } from '@/components/onboarding/PillButton';
import { Copy } from '@/constants/Copy';
import { FontFamily } from '@/constants/Fonts';
import { Theme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';

const emailOk = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function EmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { draftEmail, setDraftEmail } = useAuth();
  const [email, setEmail] = useState(draftEmail);

  const canContinue = emailOk(email);

  const onContinue = () => {
    if (!canContinue) return;
    setDraftEmail(email.trim());
    router.push('/(onboarding)/passkey');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}>
      <StatusBar style="dark" />

      <View style={[styles.safe, { paddingTop: insets.top + 4, paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.nav}>
          <OnboardingBackButton />
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{Copy.email.title}</Text>

          <View style={styles.field}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={Copy.email.placeholder}
              placeholderTextColor={Theme.color.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="done"
              onSubmitEditing={onContinue}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <PillButton
            label={Copy.email.continue}
            onPress={onContinue}
            disabled={!canContinue}
          />
        </View>
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
    paddingHorizontal: Theme.spacing.auth.horizontal,
  },
  nav: {
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: 4,
  },
  body: {
    flex: 1,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    fontFamily: FontFamily.bold,
    color: Theme.color.ink,
    textAlign: 'center',
    marginBottom: 16,
  },
  field: {
    backgroundColor: Theme.color.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    minHeight: 56,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  input: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: FontFamily.regular,
    color: Theme.color.ink,
    paddingVertical: 16,
  },
  footer: {
    paddingBottom: 8,
  },
});
