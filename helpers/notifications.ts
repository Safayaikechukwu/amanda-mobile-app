import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { NOTIFICATION_CHANNEL_ID, NotificationType } from '@/constants/NotificationTypes';
import type { UdaraNotificationData } from '@/constants/NotificationTypes';

const PROMPTED_KEY = 'udara.notifications.prompted';
export const SIGNUP_PENDING_KEY = 'udara.signup.pendingNotifications';
const PUSH_TOKEN_KEY = 'udara.notifications.pushToken';
const TOKEN_REGISTRATION_KEY = 'udara.notifications.tokenRegistration';

export type NotificationSetupResult = {
  granted: boolean;
  pushToken: string | null;
};

export type NotificationRegistration = {
  userId: string;
  pushToken: string;
  registeredAt: number;
};

export type ScheduleLocalNotificationInput = {
  title: string;
  body: string;
  data?: UdaraNotificationData;
  /** Delay before delivery. Defaults to 1 second. */
  seconds?: number;
};

let androidChannelReady = false;

/** Shows the native iOS/Android permission dialog. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const result = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return result.granted;
}

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android' || androidChannelReady) return;

  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: 'Udara',
    description: 'Transfers, savings goals, and account alerts',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#4a0508',
    sound: 'default',
    enableVibrate: true,
    showBadge: true,
  });

  androidChannelReady = true;
}

export async function registerPushTokenAsync(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const granted = await notificationPermissionGranted();
  if (!granted) return null;

  // Push tokens require a physical device (simulators can still use local notifications).
  if (!Device.isDevice) {
    if (__DEV__) {
      console.info('[notifications] Push token skipped — use a physical device for remote push.');
    }
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as { easConfig?: { projectId?: string } }).easConfig?.projectId;

  if (!projectId) {
    if (__DEV__) {
      console.info(
        '[notifications] No EAS projectId in app.json extra.eas — remote push token skipped. Local notifications still work.',
      );
    }
    return null;
  }

  try {
    await ensureAndroidChannel();
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, data);
    return data;
  } catch (error) {
    if (__DEV__) {
      console.warn('[notifications] Push token registration failed:', error);
    }
    return null;
  }
}

/** Mock backend — persists registration locally until a real API exists. */
export async function registerPushTokenWithBackend(
  userId: string,
  pushToken: string,
): Promise<NotificationRegistration> {
  await new Promise((resolve) => setTimeout(resolve, 250));

  const registration: NotificationRegistration = {
    userId,
    pushToken,
    registeredAt: Date.now(),
  };

  await AsyncStorage.setItem(TOKEN_REGISTRATION_KEY, JSON.stringify(registration));
  return registration;
}

export async function getStoredPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(PUSH_TOKEN_KEY);
}

export async function getTokenRegistration(): Promise<NotificationRegistration | null> {
  const raw = await AsyncStorage.getItem(TOKEN_REGISTRATION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as NotificationRegistration;
  } catch {
    return null;
  }
}

export async function scheduleLocalNotification({
  title,
  body,
  data,
  seconds = 1,
}: ScheduleLocalNotificationInput): Promise<string> {
  await ensureAndroidChannel();

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? { type: NotificationType.home },
      sound: 'default',
      ...(Platform.OS === 'android' ? { channelId: NOTIFICATION_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, seconds),
      repeats: false,
    },
  });
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getBadgeCount(): Promise<number> {
  if (Platform.OS === 'web') return 0;
  return Notifications.getBadgeCountAsync();
}

export async function setBadgeCount(count: number): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.setBadgeCountAsync(count);
}

/** Full post-signup setup: permission → channel → push token → welcome local notification. */
export async function setupNotificationsAfterSignup(
  userId: string | undefined,
): Promise<NotificationSetupResult> {
  const granted = await requestNotificationPermission();
  await ensureAndroidChannel();

  let pushToken: string | null = null;

  if (granted) {
    pushToken = await registerPushTokenAsync();
    if (pushToken && userId) {
      await registerPushTokenWithBackend(userId, pushToken);
    }

    await scheduleLocalNotification({
      title: 'Welcome to Udara',
      body: 'Your account is ready. Tap to open your AI partner.',
      data: { type: NotificationType.home },
      seconds: 4,
    });
  }

  return { granted, pushToken };
}

/** Demo notification for Profile → Send test notification. */
export async function sendTestNotification(): Promise<string> {
  const granted = await notificationPermissionGranted();
  if (!granted) {
    const ok = await requestNotificationPermission();
    if (!ok) throw new Error('Notification permission not granted');
  }

  return scheduleLocalNotification({
    title: 'Savings goal update',
    body: 'You hit 50% of your Emergency fund. Tap to view.',
    data: { type: NotificationType.savingsActivity, id: 'gb1' },
    seconds: 2,
  });
}

export async function markSignupNeedsNotifications(): Promise<void> {
  await AsyncStorage.setItem(SIGNUP_PENDING_KEY, '1');
}

export async function isNotificationSetupPending(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(SIGNUP_PENDING_KEY);
  return raw === '1';
}

export async function completeNotificationSetup(): Promise<void> {
  await AsyncStorage.setItem(PROMPTED_KEY, '1');
  await AsyncStorage.removeItem(SIGNUP_PENDING_KEY);
}

export async function hasPromptedForNotifications(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(PROMPTED_KEY);
  return raw === '1';
}

export async function notificationPermissionGranted(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

export type NotificationStatus = {
  permissionGranted: boolean;
  pushToken: string | null;
  registration: NotificationRegistration | null;
  isPhysicalDevice: boolean;
};

export async function getNotificationStatus(): Promise<NotificationStatus> {
  const [permissionGranted, pushToken, registration] = await Promise.all([
    notificationPermissionGranted(),
    getStoredPushToken(),
    getTokenRegistration(),
  ]);

  return {
    permissionGranted,
    pushToken,
    registration,
    isPhysicalDevice: Device.isDevice,
  };
}
