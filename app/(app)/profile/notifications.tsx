import { useState } from 'react';
import { Linking, Platform, Alert } from 'react-native';

import {
  SettingsDetailScreen,
  SettingsNote,
  SettingsRowDivider,
  SettingsToggleRow,
} from '@/components/settings/SettingsDetailScreen';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Copy } from '@/constants/Copy';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import {
  registerPushTokenAsync,
  registerPushTokenWithBackend,
  requestNotificationPermission,
} from '@/helpers/notifications';

type PendingToggle = { channel: 'push' | 'email'; enabled: boolean } | null;

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { preferences, setPushNotifications, setEmailNotifications } = usePreferences();
  const [pending, setPending] = useState<PendingToggle>(null);

  const applyPushToggle = async (enabled: boolean) => {
    if (!enabled) {
      await setPushNotifications(false);
      return;
    }

    const granted = await requestNotificationPermission();
    if (!granted) {
      if (Platform.OS === 'web') {
        await setPushNotifications(true);
        return;
      }

      Alert.alert('Notifications off', Copy.notifications.permissionRequired, [
        { text: Copy.profile.cancel, style: 'cancel' },
        {
          text: Copy.notifications.openSettings,
          onPress: () => {
            if (Platform.OS !== 'web') void Linking.openSettings();
          },
        },
      ]);
      return;
    }

    await setPushNotifications(true);
    const token = await registerPushTokenAsync();
    if (token && user?.id) {
      await registerPushTokenWithBackend(user.id, token);
    }
  };

  const confirmPending = async () => {
    if (!pending) return;

    const { channel, enabled } = pending;
    setPending(null);

    if (channel === 'push') {
      await applyPushToggle(enabled);
    } else {
      await setEmailNotifications(enabled);
    }
  };

  const dialogCopy = pending
    ? pending.channel === 'push'
      ? pending.enabled
        ? {
            title: Copy.notifications.pushOnConfirmTitle,
            confirm: Copy.notifications.turnOn,
            destructive: false,
          }
        : {
            title: Copy.notifications.pushOffConfirmTitle,
            confirm: Copy.notifications.turnOff,
            destructive: true,
          }
      : pending.enabled
        ? {
            title: Copy.notifications.emailOnConfirmTitle,
            confirm: Copy.notifications.turnOn,
            destructive: false,
          }
        : {
            title: Copy.notifications.emailOffConfirmTitle,
            confirm: Copy.notifications.turnOff,
            destructive: true,
          }
    : null;

  return (
    <>
      <SettingsDetailScreen
        title="Notifications"
        heroIcon="notifications-outline"
        heroTitle="Stay in the loop."
        heroDescription="Choose how Udara reaches you for transfers, savings updates, and account alerts."
        sectionLabel="Channels"
        footer={
          <SettingsNote>
            Push alerts need permission from your device. Email alerts go to the address on your Udara account.
          </SettingsNote>
        }>
        <SettingsToggleRow
          icon="phone-portrait-outline"
          title="Push notifications"
          subtitle="Instant alerts on this device"
          value={preferences.pushNotifications}
          onValueChange={(enabled) => setPending({ channel: 'push', enabled })}
        />
        <SettingsRowDivider />
        <SettingsToggleRow
          icon="mail-unread-outline"
          title="Email notifications"
          subtitle="Summaries and important updates"
          value={preferences.emailNotifications}
          onValueChange={(enabled) => setPending({ channel: 'email', enabled })}
        />
      </SettingsDetailScreen>

      <ConfirmDialog
        visible={pending != null}
        title={dialogCopy?.title ?? ''}
        cancelLabel={Copy.notifications.cancel}
        confirmLabel={dialogCopy?.confirm ?? Copy.notifications.turnOn}
        destructive={dialogCopy?.destructive}
        onCancel={() => setPending(null)}
        onConfirm={() => void confirmPending()}
      />
    </>
  );
}
