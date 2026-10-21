import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { HealthChip } from '@/components/insights/HealthChip';
import { MetricValue } from '@/components/insights/MetricValue';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { HEALTH_COLORS, toneFromBudgetLeft } from '@/constants/MetricHealth';
import { type SpendSeriesPoint } from '@/constants/MockInsights';
import { usePreferences } from '@/context/PreferencesContext';

type Props = {
  left: number;
  spent: number;
  budgeted: number;
  overBy: number;
  series: SpendSeriesPoint[];
};

/**
 * Spend vs budget — line is cumulative outflows from real period transactions.
 * Remaining budget is neutral; only over (red) or running low (amber) get health color.
 */
export function SpendHero({ left, spent, budgeted, overBy, series }: Props) {
  const { formatAmount } = usePreferences();
  const over = left < 0;
  const tone = toneFromBudgetLeft(left, budgeted);
  const stroke =
    tone === 'trouble'
      ? HEALTH_COLORS.trouble
      : tone === 'watch'
        ? HEALTH_COLORS.watch
        : AppTheme.accent;
  const w = 320;
  const h = 80;
  const padX = 10;
  const padY = 10;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;

  const points = series.length
    ? series
    : [
        { date: '', cumulative: 0 },
        { date: '', cumulative: spent },
      ];

  const maxY = Math.max(budgeted, spent, 1);
  const n = Math.max(points.length - 1, 1);

  const toXY = (i: number, value: number) => {
    const x = padX + (i / n) * chartW;
    const y = padY + chartH - (value / maxY) * chartH;
    return { x, y };
  };

  const spendPolyline = points
    .map((p, i) => {
      const { x, y } = toXY(i, p.cumulative);
      return `${x},${y}`;
    })
    .join(' ');

  const guidePolyline = [toXY(0, 0), toXY(n, budgeted)]
    .map((p) => `${p.x},${p.y}`)
    .join(' ');

  const last = toXY(n, points[points.length - 1]?.cumulative ?? spent);

  return (
    <LiquidGlass style={styles.cardShell} intensity={48} contentStyle={styles.card}>
      <View style={styles.top}>
        <MetricValue tone={tone} size="xl" style={styles.amountFlex}>
          {over ? `${formatAmount(overBy)} over` : `${formatAmount(left)} left`}
        </MetricValue>
        <HealthChip tone={tone} />
      </View>
      <Text style={styles.sub}>
        {formatAmount(spent)} spent · {formatAmount(budgeted)} budgeted
      </Text>

      <View style={styles.chartWrap}>
        <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          <Polyline
            points={guidePolyline}
            fill="none"
            stroke={AppTheme.borderStrong}
            strokeWidth={1.5}
            strokeDasharray="4 5"
          />
          <Polyline
            points={spendPolyline}
            fill="none"
            stroke={stroke}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Circle cx={last.x} cy={last.y} r={4} fill={stroke} />
        </Svg>
        {over ? (
          <View style={[styles.callout, { backgroundColor: HEALTH_COLORS.trouble }]}>
            <Text style={styles.calloutText}>{formatAmount(overBy)} over</Text>
          </View>
        ) : null}
      </View>
    </LiquidGlass>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    borderRadius: 16,
  },
  card: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  amountFlex: { flexShrink: 1 },
  sub: {
    color: AppTheme.textMuted,
    fontSize: 13,
    fontFamily: FontFamily.regular,
    marginTop: 6,
    marginBottom: 8,
  },
  chartWrap: {
    position: 'relative',
    height: 80,
    marginHorizontal: -4,
  },
  callout: {
    position: 'absolute',
    right: 4,
    top: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  calloutText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: FontFamily.semibold,
  },
});
