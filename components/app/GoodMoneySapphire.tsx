import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { MockHome } from '@/constants/MockData';

export function GoodMoneySapphire() {
  const { sapphire } = MockHome;

  return (
    <LinearGradient
      colors={[AppTheme.sapphireStart, AppTheme.sapphireMid, AppTheme.sapphireEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.gemRow}>
          <View style={styles.gem} />
          <View style={styles.titleBlock}>
            <Text style={styles.label}>{sapphire.label}</Text>
            <Text style={styles.status}>{sapphire.status}</Text>
          </View>
        </View>
        <Text style={styles.score}>{sapphire.score}</Text>
      </View>
      <Text style={styles.subtitle} numberOfLines={2}>
        {sapphire.subtitle}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  gemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  titleBlock: {
    flexShrink: 1,
  },
  gem: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.25)',
    transform: [{ rotate: '45deg' }],
  },
  label: {
    color: '#fff',
    fontSize: 13,
    fontFamily: FontFamily.semibold,
  },
  status: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontFamily: FontFamily.regular,
    marginTop: 1,
  },
  score: {
    color: '#fff',
    fontSize: 32,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.8,
    marginLeft: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: FontFamily.regular,
  },
});
