import { GlassPressable } from '@/components/ui/GlassPressable';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryAuthButton({ label, onPress, disabled, loading }: Props) {
  return (
    <GlassPressable
      label={label}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      fullWidth
    />
  );
}
