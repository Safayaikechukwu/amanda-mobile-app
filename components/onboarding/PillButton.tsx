import { GlassPressable } from '@/components/ui/GlassPressable';

type Variant = 'primary' | 'secondary';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
};

export function PillButton({ label, onPress, variant = 'primary', disabled, loading }: Props) {
  return (
    <GlassPressable
      label={label}
      onPress={onPress}
      variant={variant}
      size="md"
      disabled={disabled}
      loading={loading}
      fullWidth
    />
  );
}
