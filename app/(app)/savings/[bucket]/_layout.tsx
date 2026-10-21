import { Stack } from 'expo-router';

export default function BucketLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="withdraw" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="plan/[planId]" />
    </Stack>
  );
}
