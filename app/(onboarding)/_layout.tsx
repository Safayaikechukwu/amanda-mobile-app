import { Redirect, Stack } from 'expo-router';

import { AuthGateRedirect } from '@/components/auth/AuthGateRedirect';

export default function OnboardingLayout() {
  return (
    <>
      <AuthGateRedirect target="onboarding" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          presentation: 'card',
          gestureEnabled: true,
          contentStyle: { backgroundColor: '#ffffff' },
        }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="email" />
        <Stack.Screen name="passkey" />
      </Stack>
    </>
  );
}
