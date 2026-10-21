import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { FontFamily } from '@/constants/Fonts';
import { Theme } from '@/constants/Theme';

export function OrDivider() {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.label}>OR</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e5e5',
  },
  label: {
    fontSize: 13,
    color: Theme.color.muted,
    fontFamily: FontFamily.medium,
  },
});
