import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { MockHome } from '@/constants/MockData';

type TileProps = {
  label: string;
  value: string;
  hint: string;
  wide?: boolean;
};

function BentoTile({ label, value, hint, wide }: TileProps) {
  return (
    <View style={[styles.tile, wide && styles.tileWide]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.hint} numberOfLines={1}>
        {hint}
      </Text>
    </View>
  );
}

export function BentoGrid() {
  const { bento } = MockHome;

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <BentoTile {...bento.runway} />
        <BentoTile {...bento.upcoming} />
      </View>
      <View style={styles.row}>
        <BentoTile {...bento.neededToday} />
        <BentoTile {...bento.score} />
      </View>
      <BentoTile {...bento.savedToday} wide />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 8, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8 },
  tile: {
    flex: 1,
    backgroundColor: AppTheme.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: AppTheme.border,
    minHeight: 72,
    justifyContent: 'center',
  },
  tileWide: { flex: undefined, width: '100%', minHeight: 64 },
  label: {
    color: AppTheme.textMuted,
    fontSize: 11,
    fontFamily: FontFamily.medium,
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  value: {
    color: AppTheme.text,
    fontSize: 16,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.2,
    marginBottom: 1,
  },
  hint: {
    color: AppTheme.textFaint,
    fontSize: 10,
    fontFamily: FontFamily.regular,
  },
});
