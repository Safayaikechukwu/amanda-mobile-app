import { ScrollView, StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/app/AppScreen';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { MockBills } from '@/constants/MockData';

export default function BillsScreen() {
  return (
    <AppScreen
      title="Bills"
      subtitle="Electricity, airtime, data, TV and more."
      headerVariant="large">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {MockBills.map((bill) => (
          <LiquidGlass key={bill.id} style={styles.cardShell} intensity={48} contentStyle={styles.card}>
            <View style={styles.cardCopy}>
              <Text style={styles.name}>{bill.name}</Text>
              <Text style={styles.provider}>{bill.provider}</Text>
            </View>
            <Text style={styles.due}>{bill.due}</Text>
          </LiquidGlass>
        ))}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  cardShell: { borderRadius: 14 },
  card: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cardCopy: { flex: 1 },
  name: { color: AppTheme.text, fontSize: 17, fontFamily: FontFamily.semibold },
  provider: { color: AppTheme.textMuted, fontSize: 13, fontFamily: FontFamily.regular, marginTop: 2 },
  due: { color: AppTheme.textFaint, fontSize: 13, fontFamily: FontFamily.medium },
});
