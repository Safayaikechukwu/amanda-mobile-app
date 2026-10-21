import * as Linking from 'expo-linking';

import {
  SettingsActionRow,
  SettingsDetailScreen,
  SettingsNote,
  SettingsRowDivider,
} from '@/components/settings/SettingsDetailScreen';
import { useAuth } from '@/context/AuthContext';
import { MockHome } from '@/constants/MockData';
import {
  openUdaraCommunity,
  openWhatsAppSupport,
  SUPPORT_EMAIL,
  SUPPORT_WHATSAPP_DISPLAY,
} from '@/helpers/support';

export default function SupportScreen() {
  const { user } = useAuth();
  const name = user?.name ?? MockHome.userName;

  const emailSupport = () => {
    void Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Udara support request')}`);
  };

  return (
    <SettingsDetailScreen
      title="Support"
      heroIcon="headset-outline"
      heroTitle="Help & support."
      heroDescription="Send us the issue and any transaction ID so the right team can pick it up."
      sectionLabel="Contact"
      footer={
        <SettingsNote small>
          Use the same email address on your Udara account so we can find your profile faster.
        </SettingsNote>
      }>
      <SettingsActionRow
        icon="mail-outline"
        title="Email support"
        subtitle={SUPPORT_EMAIL}
        actionLabel="Email"
        onPress={emailSupport}
      />
      <SettingsRowDivider />
      <SettingsActionRow
        icon="logo-whatsapp"
        title="WhatsApp support"
        subtitle={SUPPORT_WHATSAPP_DISPLAY}
        actionLabel="Chat"
        onPress={() => void openWhatsAppSupport(name)}
      />
      <SettingsRowDivider />
      <SettingsActionRow
        icon="people-outline"
        title="Udara community"
        subtitle="Join the community on WhatsApp"
        actionLabel="Join"
        onPress={() => void openUdaraCommunity()}
      />
    </SettingsDetailScreen>
  );
}
