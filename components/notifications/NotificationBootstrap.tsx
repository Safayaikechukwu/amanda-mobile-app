import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { routeFromNotificationData } from '@/helpers/notificationRouting';
import {
  registerPushTokenAsync,
  registerPushTokenWithBackend,
} from '@/helpers/notifications';

function navigateFromNotification(
  router: ReturnType<typeof useRouter>,
  data: Record<string, unknown> | undefined,
) {
  const href = routeFromNotificationData(data);
  if (href) router.push(href as never);
}

/**
 * Global listeners: notification taps, cold-start opens, push token refresh.
 */
export function NotificationBootstrap() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const handledColdStart = useRef(false);

  // Route when user taps a notification (app in background / foreground).
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      navigateFromNotification(
        router,
        response.notification.request.content.data as Record<string, unknown>,
      );
    });

    return () => sub.remove();
  }, [router]);

  // Route when app opened from a killed state via notification tap.
  useEffect(() => {
    if (Platform.OS === 'web' || handledColdStart.current || !isLoggedIn) return;

    handledColdStart.current = true;

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      navigateFromNotification(
        router,
        response.notification.request.content.data as Record<string, unknown>,
      );
    });
  }, [isLoggedIn, router]);

  // Re-register push token when OS rotates it (logged-in users only).
  useEffect(() => {
    if (Platform.OS === 'web' || !isLoggedIn || !user?.id) return;

    const sub = Notifications.addPushTokenListener(({ data: token }) => {
      void registerPushTokenWithBackend(user.id, token);
    });

    // Ensure token is current after login.
    void registerPushTokenAsync().then((token) => {
      if (token) void registerPushTokenWithBackend(user.id, token);
    });

    return () => sub.remove();
  }, [isLoggedIn, user?.id]);

  return null;
}
