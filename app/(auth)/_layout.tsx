import { Stack } from 'expo-router';

import { AuthGateRedirect } from '@/components/auth/AuthGateRedirect';

export default function AuthLayout() {
  return (
    <>
      <AuthGateRedirect target="auth" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#ffffff' },
        }}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="passkey" />
      </Stack>
    </>
  );
}
