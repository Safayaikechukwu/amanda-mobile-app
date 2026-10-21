import { GlassPressable } from '@/components/ui/GlassPressable';
import { Text } from '@/components/ui/Text';
import { FontFamily } from '@/constants/Fonts';
import { Theme } from '@/constants/Theme';

type Props = {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function SocialAuthButton({ label, icon, onPress, loading, disabled }: Props) {
  return (
    <GlassPressable
      onPress={onPress}
      variant="secondary"
      disabled={disabled}
      loading={loading}
      fullWidth
      style={{ minHeight: Theme.spacing.socialButtonHeight }}
      accessibilityLabel={label}>
      {icon}
      <Text
        style={{
          color: Theme.color.ink,
          fontSize: Theme.type.socialButton.fontSize,
          fontFamily: FontFamily.semibold,
          letterSpacing: Theme.type.socialButton.letterSpacing,
        }}>
        {label}
      </Text>
    </GlassPressable>
  );
}
