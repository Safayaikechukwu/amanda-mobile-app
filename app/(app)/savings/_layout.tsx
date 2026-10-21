import { Stack } from 'expo-router';

export default function SavingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[bucket]" />
      <Stack.Screen name="activity/index" />
      <Stack.Screen name="activity/[id]" />
    </Stack>
  );
}
