import { StyleSheet, TextInput, View, ViewStyle } from 'react-native';

import { GlassPressable } from '@/components/ui/GlassPressable';
import { Text } from '@/components/ui/Text';
import { FontFamily } from '@/constants/Fonts';
import { Theme } from '@/constants/Theme';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  inverted?: boolean;
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = 'primary', disabled, inverted, style }: Props) {
  const glassVariant =
    variant === 'ghost' ? 'ghost' : variant === 'secondary' ? 'secondary' : 'primary';

  return (
    <GlassPressable
      label={label}
      onPress={onPress}
      variant={glassVariant}
      disabled={disabled}
      style={style}
    />
  );
}

type InputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'number-pad';
  maxLength?: number;
};

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  maxLength,
}: InputProps) {
  return (
    <View style={inputStyles.wrap}>
      <Text variant="label" inverted muted style={inputStyles.label}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Theme.color.whiteFaint}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        maxLength={maxLength}
        style={inputStyles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  label: { marginBottom: 8 },
  input: {
    height: Theme.spacing.inputHeight,
    borderRadius: Theme.radius.card + 4,
    paddingHorizontal: 16,
    backgroundColor: Theme.color.surfaceDark,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.color.surfaceDarkBorder,
    color: Theme.color.white,
    fontSize: 17,
    fontFamily: FontFamily.medium,
  },
});
