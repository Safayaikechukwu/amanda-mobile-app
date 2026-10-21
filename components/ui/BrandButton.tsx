import { ViewStyle } from 'react-native';

import { GlassPressable } from '@/components/ui/GlassPressable';

type Variant = 'light' | 'dark' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
};

export function BrandButton({ label, onPress, variant = 'light', icon, style, disabled }: Props) {
  const glassVariant =
    variant === 'ghost' ? 'ghost' : variant === 'dark' ? 'primary' : 'secondary';

  if (icon) {
    return (
      <GlassPressable
        onPress={onPress}
        variant={glassVariant}
        disabled={disabled}
        fullWidth={false}
        style={style}
        accessibilityLabel={label}>
        {icon}
      </GlassPressable>
    );
  }

  return (
    <GlassPressable
      label={label}
      onPress={onPress}
      variant={glassVariant}
      disabled={disabled}
      fullWidth={false}
      style={style}
    />
  );
}
