import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Brand } from '@/constants/Brand';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'number-pad';
  maxLength?: number;
};

export function BrandInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  maxLength,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Brand.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        maxLength={maxLength}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  label: {
    color: Brand.whiteMuted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  input: {
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: Brand.buttonDark,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Brand.buttonDarkBorder,
    color: Brand.white,
    fontSize: 17,
    fontWeight: '500',
  },
});
