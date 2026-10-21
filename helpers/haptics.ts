import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

async function runHaptic(fn: () => Promise<void>) {
  if (Platform.OS === 'web') return;
  try {
    await fn();
  } catch {
    // Device has no haptic engine — ignore.
  }
}

export function hapticLight() {
  void runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function hapticMedium() {
  void runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export function hapticSelection() {
  void runHaptic(() => Haptics.selectionAsync());
}

export function hapticWarning() {
  void runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}

export function hapticSuccess() {
  void runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}
