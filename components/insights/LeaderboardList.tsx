import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { formatNaira } from '@/constants/MockInsights';

export type LeaderboardItem = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
};

type Props = {
  items: LeaderboardItem[];
  /** Denominator for % share (defaults to sum of amounts). */
  total?: number;
  hint?: string;
  emptyLabel?: string;
  empty?: ReactNode;
  onItemPress?: (item: LeaderboardItem) => void;
};

/** Rank badge + relative bar — Recipients and Bills ranking. */
export function LeaderboardList({
  items,
  total: totalProp,
  hint,
  emptyLabel = 'Nothing to rank yet.',
  empty,
  onItemPress,
}: Props) {
  if (items.length === 0) {
    return <>{empty ?? <Text style={styles.empty}>{emptyLabel}</Text>}</>;
  }

  const top = items[0]?.amount || 1;
  const total = totalProp && totalProp > 0 ? totalProp : items.reduce((s, i) => s + i.amount, 0) || 1;

  return (
    <View style={styles.list}>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {items.map((item, i) => {
        const rank = i + 1;
        const share = Math.round((item.amount / total) * 100);
        const bar = Math.max(6, (item.amount / top) * 100);
        const topThree = rank <= 3;
        const row = (
          <View style={styles.row}>
            <View style={[styles.badge, topThree && styles.badgeTop]}>
              <Text style={[styles.rank, topThree && styles.rankTop]}>{rank}</Text>
            </View>
            <View style={styles.body}>
              <View style={styles.header}>
                <View style={styles.copy}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.sub}>
                    {item.subtitle}
                    {share > 0 ? ` · ${share}%` : ''}
                  </Text>
                </View>
                <Text style={styles.amount}>{formatNaira(item.amount)}</Text>
              </View>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    { width: `${bar}%`, opacity: Math.max(0.35, 1 - i * 0.06) },
                  ]}
                />
              </View>
            </View>
          </View>
        );

        if (!onItemPress) return <View key={item.id}>{row}</View>;

        return (
          <Pressable
            key={item.id}
            onPress={() => onItemPress(item)}
            style={({ pressed }) => [pressed && styles.pressed]}>
            {row}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  hint: {
    color: AppTheme.textFaint,
    fontSize: 12,
    fontFamily: FontFamily.regular,
    marginBottom: 2,
  },
  empty: {
    color: AppTheme.textMuted,
    fontSize: 14,
    fontFamily: FontFamily.regular,
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: AppTheme.track,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  badgeTop: {
    backgroundColor: AppTheme.accent,
  },
  rank: {
    color: AppTheme.textMuted,
    fontSize: 12,
    fontFamily: FontFamily.bold,
  },
  rankTop: {
    color: '#fff',
  },
  body: { flex: 1, minWidth: 0, gap: 6 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  copy: { flex: 1, minWidth: 0 },
  title: {
    color: AppTheme.text,
    fontSize: 14,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.2,
  },
  sub: {
    color: AppTheme.textFaint,
    fontSize: 11,
    fontFamily: FontFamily.regular,
    marginTop: 1,
    lineHeight: 15,
  },
  amount: {
    color: AppTheme.text,
    fontSize: 14,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.3,
  },
  track: {
    height: 5,
    backgroundColor: AppTheme.track,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: AppTheme.accent,
    borderRadius: 3,
  },
  pressed: { opacity: 0.78 },
});
