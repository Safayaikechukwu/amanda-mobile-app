import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { BiometricKind } from '@/helpers/localAuth';

type IonName = ComponentProps<typeof Ionicons>['name'];

/** Icon for passkey / biometric sign-in — not the official FIDO Passkey mark. */
export function passkeySignInIcon(
  bioKind: BiometricKind,
  bioAvailable: boolean,
  variant: 'hero' | 'button' = 'hero',
): IonName {
  if (bioAvailable && bioKind === 'fingerprint') {
    return variant === 'button' ? 'finger-print-outline' : 'finger-print';
  }
  if (bioAvailable && bioKind === 'face') {
    return variant === 'button' ? 'scan-outline' : 'scan';
  }
  return variant === 'button' ? 'key-outline' : 'key';
}

export function passkeySignInIconLabel(bioKind: BiometricKind, bioAvailable: boolean): string {
  if (bioAvailable && bioKind === 'fingerprint') return 'Fingerprint';
  if (bioAvailable && bioKind === 'face') return 'Face ID';
  return 'Passkey';
}
