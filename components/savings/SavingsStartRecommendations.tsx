import { View } from 'react-native';

import { bucketStyles as styles } from '@/components/savings/bucketStyles';
import { CollapsibleTemplateSection } from '@/components/savings/CollapsibleTemplateSection';
import { SavingsCustomTemplateRow } from '@/components/savings/SavingsCustomTemplateRow';
import { TableActionButton } from '@/components/savings/TableActionButton';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import type { CUSTOM_SAVINGS_HINT } from '@/constants/SavingsTemplates';

export type SavingsRecommendationRow = {
  id: string;
  primary: string;
  secondary: string;
  actionLabel: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

type Props = {
  title: string;
  leftColumn: string;
  rightColumn: string;
  rows: SavingsRecommendationRow[];
  bucket: keyof typeof CUSTOM_SAVINGS_HINT;
  accentColor: string;
  customActionLabel: string;
  onCustomPress: () => void;
};

/** Preset + custom starter table shared across savings bucket screens. */
export function SavingsStartRecommendations({
  title,
  leftColumn,
  rightColumn,
  rows,
  bucket,
  accentColor,
  customActionLabel,
  onCustomPress,
}: Props) {
  return (
    <CollapsibleTemplateSection title={title}>
      <LiquidGlass style={styles.tableCard} intensity={44} contentStyle={styles.tableInner}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderLabel}>{leftColumn}</Text>
          <Text style={[styles.tableHeaderLabel, styles.tableHeaderRight]}>{rightColumn}</Text>
          <View style={styles.tableHeaderAction} />
        </View>
        {rows.map((row) => (
          <View key={row.id} style={[styles.tableRow, styles.tableRowBorder]}>
            <Text style={[styles.tablePrimary, { color: accentColor }]}>{row.primary}</Text>
            <Text style={styles.tableSecondary}>{row.secondary}</Text>
            <View style={styles.tableHeaderAction}>
              <TableActionButton
                label={row.actionLabel}
                onPress={row.onPress}
                accentColor={accentColor}
                accessibilityLabel={row.accessibilityLabel ?? `${row.actionLabel} ${row.primary}`}
              />
            </View>
          </View>
        ))}
        <SavingsCustomTemplateRow
          bucket={bucket}
          accentColor={accentColor}
          actionLabel={customActionLabel}
          onPress={onCustomPress}
        />
      </LiquidGlass>
    </CollapsibleTemplateSection>
  );
}
