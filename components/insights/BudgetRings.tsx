import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { formatNaira, type InsightBudget } from '@/constants/MockInsights';

const ICONS: Record<InsightBudget['icon'], keyof typeof Ionicons.glyphMap> = {
  restaurant: 'restaurant-outline',
  cart: 'cart-outline',
  flash: 'flash-outline',
  car: 'car-outline',
  home: 'home-outline',
  heart: 'heart-outline',
};

function ringColor(spent: number, limit: number) {
  const pct = spent / limit;
  if (pct >= 1) return '#dc2626';
  if (pct >= 0.85) return '#ea580c';
  if (pct >= 0.6) return '#d97706';
  return '#059669';
}

function BudgetRing({ budget }: { budget: InsightBudget }) {
  const size = 72;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(budget.spent / budget.limit, 1);
  const over = budget.spent > budget.limit;
  const remaining = budget.limit - budget.spent;
  const color = ringColor(budget.spent, budget.limit);

  return (
    <View style={styles.item}>
      <View style={styles.ringWrap}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={AppTheme.border}
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${c * pct} ${c}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.iconCenter}>
          <Ionicons name={ICONS[budget.icon]} size={22} color={AppTheme.text} />
        </View>
      </View>
      <Text style={[styles.amount, over && styles.amountOver]}>
        {formatNaira(over ? budget.spent - budget.limit : remaining)}
      </Text>
      <Text style={styles.status}>{over ? 'over' : 'left'}</Text>
      <Text style={styles.name}>{budget.name}</Text>
    </View>
  );
}

type Props = {
  budgets: InsightBudget[];
};

export function BudgetRings({ budgets }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {budgets.map((b) => (
        <BudgetRing key={b.id} budget={b} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 18,
    paddingRight: 8,
  },
  item: {
    width: 84,
    alignItems: 'center',
  },
  ringWrap: {
    width: 72,
    height: 72,
    marginBottom: 8,
  },
  iconCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    color: AppTheme.text,
    fontSize: 14,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.2,
  },
  amountOver: {
    color: '#dc2626',
  },
  status: {
    color: AppTheme.textFaint,
    fontSize: 12,
    fontFamily: FontFamily.regular,
    marginTop: 1,
  },
  name: {
    color: AppTheme.textMuted,
    fontSize: 12,
    fontFamily: FontFamily.medium,
    marginTop: 4,
  },
});
