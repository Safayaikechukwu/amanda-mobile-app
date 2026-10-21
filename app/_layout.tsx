import '@/helpers/notificationHandler';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { NotificationBootstrap } from '@/components/notifications/NotificationBootstrap';
import { InAppBrowserHost } from '@/components/ui/InAppBrowserHost';
import { Theme } from '@/constants/Theme';
import { useThemeFonts } from '@/constants/Fonts';
import { AuthProvider } from '@/context/AuthContext';
import { MoneyControlsProvider } from '@/context/MoneyControlsContext';
import { PreferencesProvider } from '@/context/PreferencesContext';

export { ErrorBoundary } from 'expo-router';

/** Always boot through the auth gate — never restore onboarding as the launch screen. */
export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loaded, error } = useThemeFonts();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) {
    return (
      <>
        <InAppBrowserHost />
        <View style={{ flex: 1, backgroundColor: '#4a0508' }} />
      </>
    );
  }

  return (
    <AuthProvider>
      <PreferencesProvider>
        <MoneyControlsProvider>
          <NotificationBootstrap />
          <InAppBrowserHost />
          <Stack
            initialRouteName="index"
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: { backgroundColor: Theme.color.bg },
            }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        </MoneyControlsProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}
