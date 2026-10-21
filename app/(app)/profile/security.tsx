import { useCallback, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';

import {
  SettingsActionRow,
  SettingsDetailScreen,
  SettingsNote,
  SettingsRowDivider,
  SettingsStatusRow,
  SettingsStrengthBanner,
} from '@/components/settings/SettingsDetailScreen';
import { Text } from '@/components/ui/Text';
import { Copy } from '@/constants/Copy';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { biometricLabel, canUseBiometrics, getBiometricKind, promptPasskeyAuth } from '@/helpers/localAuth';
import { openPrivacyPolicy, openTermsOfUse } from '@/helpers/support';

export default function SecurityPrivacyScreen() {
  const [unlockLabel, setUnlockLabel] = useState('Passkey');

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const [biometrics, kind] = await Promise.all([canUseBiometrics(), getBiometricKind()]);
        setUnlockLabel(biometrics ? biometricLabel(kind) : 'Passkey');
      })();
    }, []),
  );

  const onChangePin = async () => {
    const ok = await promptPasskeyAuth('Confirm it’s you before changing your security PIN');
    if (!ok) return;

    Alert.alert(
      'Change security PIN',
      'Choose a new 4-digit PIN for withdrawals and sensitive account actions.',
      [
        { text: Copy.profile.cancel, style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            Alert.alert('PIN updated', 'Your security PIN has been changed.');
          },
        },
      ],
    );
  };

  return (
    <SettingsDetailScreen
      title="Security"
      heroIcon="shield-checkmark-outline"
      heroTitle="Security & privacy."
      heroDescription={`Identity checks, withdrawal protection, and ${unlockLabel} keep your Udara account secure.`}
      sectionLabel="Protection"
      footer={
        <SettingsNote small>
          Read our{' '}
          <TextLink label="Privacy Policy" onPress={() => void openPrivacyPolicy()} /> and{' '}
          <TextLink label="Terms of Use" onPress={() => void openTermsOfUse()} /> for how we handle
          your data.
        </SettingsNote>
      }>
      <SettingsStrengthBanner level="Strong" />
      <SettingsRowDivider inset />
      <SettingsStatusRow
        icon="person-circle-outline"
        title="Identity verification"
        subtitle="BVN and government ID confirmed"
        status="Verified"
        tone="success"
      />
      <SettingsRowDivider />
      <SettingsStatusRow
        icon="cash-outline"
        title="Withdrawal verification"
        subtitle="Extra step before money leaves Udara"
        status="Enabled"
        tone="success"
      />
      <SettingsRowDivider />
      <SettingsActionRow
        icon="keypad-outline"
        title="Security PIN"
        subtitle="Used for withdrawals and sensitive actions"
        actionLabel="Change"
        onPress={() => void onChangePin()}
      />
      <SettingsRowDivider />
      <SettingsActionRow
        icon="finger-print-outline"
        title="Device unlock"
        subtitle={`Sign in and confirm with ${unlockLabel}`}
      />
    </SettingsDetailScreen>
  );
}

function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Text
      onPress={onPress}
      style={styles.link}
      accessibilityRole="link">
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  link: {
    color: AppTheme.accent,
    fontFamily: FontFamily.semibold,
  },
});
