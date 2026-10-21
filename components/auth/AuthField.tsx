import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { FontFamily } from '@/constants/Fonts';
import { Theme } from '@/constants/Theme';

type Props = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  editable?: boolean;
  onToggleSecure?: () => void;
  showSecureToggle?: boolean;
};

export function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  editable = true,
  onToggleSecure,
  showSecureToggle,
}: Props) {
  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="caption" muted style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View style={[styles.field, !editable && styles.fieldDisabled]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={editable}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        {showSecureToggle ? (
          <Pressable accessibilityRole="button" onPress={onToggleSecure} style={styles.eyeBtn}>
            <Text variant="caption" muted>
              {secureTextEntry ? 'Show' : 'Hide'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { marginBottom: 8 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: Theme.radius.card,
    backgroundColor: Theme.color.bg,
    minHeight: Theme.spacing.inputHeight,
    paddingHorizontal: 14,
  },
  fieldDisabled: {
    backgroundColor: Theme.color.bgSoft,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Theme.color.ink,
    fontFamily: FontFamily.regular,
    paddingVertical: 12,
  },
  eyeBtn: { paddingLeft: 8 },
});
