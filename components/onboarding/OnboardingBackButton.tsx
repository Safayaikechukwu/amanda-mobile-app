import { useRouter } from 'expo-router';

import { BackIconButton } from '@/components/ui/BackIconButton';

type Props = {
  onPress?: () => void;
};

/** Onboarding back — liquid glass on supported iOS, solid fallback elsewhere. */
export function OnboardingBackButton({ onPress }: Props) {
  const router = useRouter();

  return (
    <BackIconButton
      onPress={onPress ?? (() => router.back())}
      accessibilityLabel="Go back"
      variant="auto"
    />
  );
}
