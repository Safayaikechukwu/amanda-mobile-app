import { View } from 'react-native';

import { bucketStyles as styles } from '@/components/savings/bucketStyles';
import { TableActionButton } from '@/components/savings/TableActionButton';
import { Text } from '@/components/ui/Text';
import {
  CUSTOM_SAVINGS_HINT,
  CUSTOM_SAVINGS_TITLE,
} from '@/constants/SavingsTemplates';

type BucketKey = keyof typeof CUSTOM_SAVINGS_HINT;

type Props = {
  bucket: BucketKey;
  accentColor: string;
  actionLabel: string;
  onPress: () => void;
};

export function SavingsCustomTemplateRow({
  bucket,
  accentColor,
  actionLabel,
  onPress,
}: Props) {
  const hint = CUSTOM_SAVINGS_HINT[bucket];

  return (
    <View style={[styles.tableRow, styles.tableRowCustom]}>
      <Text style={[styles.tablePrimary, { color: accentColor }]}>{CUSTOM_SAVINGS_TITLE}</Text>
      <Text style={styles.tableSecondary}>{hint}</Text>
      <View style={styles.tableHeaderAction}>
        <TableActionButton
          label={actionLabel}
          onPress={onPress}
          accentColor={accentColor}
          accessibilityLabel={`${actionLabel} custom ${bucket}`}
        />
      </View>
    </View>
  );
}
