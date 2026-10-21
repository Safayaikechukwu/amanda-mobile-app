import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';

import {
  SettingsActionRow,
  SettingsDetailScreen,
  SettingsNote,
  SettingsRowDivider,
} from '@/components/settings/SettingsDetailScreen';
import { Copy } from '@/constants/Copy';
import { MockHome } from '@/constants/MockData';
import { useAuth } from '@/context/AuthContext';

function formatMemberSince(userId: string | undefined): string {
  const match = userId?.match(/udara-(\d+)/);
  if (!match) return 'Aug 2025';
  const date = new Date(Number(match[1]));
  if (Number.isNaN(date.getTime())) return 'Aug 2025';
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

function formatPhone(phone: string | null | undefined): string {
  if (!phone) return 'Not added';
  return phone.replace(/(\+\d{3})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
}

export default function AccountInformationScreen() {
  const { user } = useAuth();

  const name = user?.name ?? MockHome.userName;
  const email = user?.email ?? 'you@useudara.com';
  const phone = user?.phone ?? '+2348012345678';
  const accountId = user?.id ?? 'udara-demo';
  const memberSince = formatMemberSince(user?.id);
  const signInLabel = user?.passkeyRegistered ? 'Passkey' : 'Email';

  const copyEmail = async () => {
    await Clipboard.setStringAsync(email);
    Alert.alert(Copy.profile.emailCopied, Copy.profile.emailCopiedBody);
  };

  const copyPhone = async () => {
    await Clipboard.setStringAsync(phone);
    Alert.alert('Phone copied', 'Paste it anywhere you need your number.');
  };

  const copyAccountId = async () => {
    await Clipboard.setStringAsync(accountId);
    Alert.alert('Account ID copied', 'Paste it when contacting support.');
  };

  return (
    <SettingsDetailScreen
      title="Account"
      heroIcon="person-outline"
      heroTitle="Your account."
      heroDescription="Name, contact details, and how you sign in to Udara."
      sectionLabel="Profile"
      footer={
        <SettingsNote small>
          Contact support if any of these details need updating on your account.
        </SettingsNote>
      }>
      <SettingsActionRow icon="person-outline" title="Full name" subtitle={name} />
      <SettingsRowDivider />
      <SettingsActionRow
        icon="mail-outline"
        title="Email"
        subtitle={email}
        actionLabel="Copy"
        onPress={() => void copyEmail()}
      />
      <SettingsRowDivider />
      <SettingsActionRow
        icon="call-outline"
        title="Phone"
        subtitle={formatPhone(phone)}
        actionLabel="Copy"
        onPress={() => void copyPhone()}
      />
      <SettingsRowDivider />
      <SettingsActionRow icon="finger-print-outline" title="Sign-in method" subtitle={signInLabel} />
      <SettingsRowDivider />
      <SettingsActionRow icon="calendar-outline" title="Member since" subtitle={memberSince} />
      <SettingsRowDivider />
      <SettingsActionRow
        icon="key-outline"
        title="Account ID"
        subtitle={accountId}
        actionLabel="Copy"
        onPress={() => void copyAccountId()}
      />
    </SettingsDetailScreen>
  );
}
