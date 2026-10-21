import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  Platform,
} from 'react-native';

import { AppScreen } from '@/components/app/AppScreen';
import { ScreenLargeHeader } from '@/components/app/ScreenLargeHeader';
import { TAB_BAR_SCROLL_INSET } from '@/components/app/AppTabBar';
import { AdvisorBreakdown } from '@/components/insights/AdvisorBreakdown';
import { BreakdownTabs, type BreakdownKey } from '@/components/insights/BreakdownTabs';
import { InsightHero } from '@/components/insights/InsightHero';
import {
  InsightsTabPager,
  type InsightsTabPagerHandle,
} from '@/components/insights/InsightsTabPager';
import { LeaderboardList } from '@/components/insights/LeaderboardList';
import { PeriodSwitcher, formatPeriodRange } from '@/components/insights/PeriodSwitcher';
import { PillTabs } from '@/components/insights/PillTabs';
import { SectionHeader } from '@/components/insights/SectionHeader';
import { SegmentRail } from '@/components/insights/SegmentRail';
import { SpendHero } from '@/components/insights/SpendHero';
import { StatStrip } from '@/components/insights/StatStrip';
import { TransactionRow } from '@/components/insights/TransactionRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { GlassPressable } from '@/components/ui/GlassPressable';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import {
  CATEGORY_META,
  buildBillStats,
  buildSubscriptionStats,
  formatDisplayDate,
  formatNaira,
  getInsightsForPeriod,
  MockSubscriptions,
  MockUpcomingFromBills,
  setLiveSubscriptions,
  type CustomDateRange,
  type InsightPeriod,
  type InsightTab,
  type MockSubscription,
} from '@/constants/MockInsights';
import {
  toneFromBillsDue,
  toneFromReviewCount,
  toneFromSpend,
  toneFromSubscriptionBurn,
} from '@/constants/MetricHealth';
import { openUdaraChat } from '@/helpers/openUdaraChat';

const TABS: { key: InsightTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'bills', label: 'Bills' },
  { key: 'subscriptions', label: 'Subscriptions' },
];

const TX_RAIL = [
  { key: 'all' as const, label: 'All' },
  { key: 'review' as const, label: 'Needs review' },
];

const BILL_RAIL = [
  { key: 'ranking' as const, label: 'Ranking' },
  { key: 'upcoming' as const, label: 'Upcoming' },
];

const SUB_RAIL = [
  { key: 'all' as const, label: 'All' },
  { key: 'active' as const, label: 'Active' },
  { key: 'upcoming' as const, label: 'Upcoming' },
  { key: 'rank' as const, label: 'Rank' },
];

const DEFAULT_CUSTOM: CustomDateRange = {
  start: '2026-01-13',
  end: '2026-05-20',
};

const SUB_TAB_INDEX = TABS.findIndex((t) => t.key === 'subscriptions');
const webPanY = Platform.OS === 'web' ? ({ touchAction: 'pan-y' } as object) : null;

export default function InsightsScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const pagerRef = useRef<InsightsTabPagerHandle>(null);
  const [pagerWidth, setPagerWidth] = useState(windowWidth);
  const [pagerHeight, setPagerHeight] = useState(0);
  const [tab, setTab] = useState<InsightTab>('overview');
  const [pageProgress, setPageProgress] = useState(0);
  const [period, setPeriod] = useState<InsightPeriod>('month');
  const [offset, setOffset] = useState(0);
  const [customRange, setCustomRange] = useState<CustomDateRange>(DEFAULT_CUSTOM);
  const [subscriptions, setSubscriptions] = useState<MockSubscription[]>(MockSubscriptions);

  useEffect(() => {
    setLiveSubscriptions(subscriptions);
  }, [subscriptions]);
  const data = useMemo(
    () => getInsightsForPeriod(period, customRange),
    [period, customRange],
  );
  const rangeLabel = formatPeriodRange(period, offset, customRange);
  const width = pagerWidth > 0 ? pagerWidth : windowWidth;

  const selectTab = (next: InsightTab) => {
    const index = TABS.findIndex((t) => t.key === next);
    if (index < 0 || width <= 0) return;
    pagerRef.current?.goToPage(index, true);
  };

  useEffect(() => {
    if (width <= 0) return;
    const index = TABS.findIndex((t) => t.key === tab);
    pagerRef.current?.goToPage(index, false);
  }, [width]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPageSettled = (page: number) => {
    setPageProgress(page);
    const next = TABS[page]?.key;
    if (next) setTab(next);
  };

  const onProgressChange = (progress: number) => {
    setPageProgress(progress);
  };

  const addOpacity =
    SUB_TAB_INDEX < 0 ? 0 : Math.max(0, 1 - Math.abs(pageProgress - SUB_TAB_INDEX) * 1.6);

  const askToAddSubscription = () => {
    openUdaraChat(router, 'I want to add a subscription');
  };

  const chrome = (
    <View style={styles.chrome}>
      <ScreenLargeHeader
        title="Insights"
        right={
          <View pointerEvents={addOpacity > 0.45 ? 'auto' : 'none'} style={{ opacity: addOpacity }}>
            <GlassPressable
              label="Add"
              onPress={askToAddSubscription}
              size="sm"
              fullWidth={false}
              accessibilityLabel="Add subscription"
            />
          </View>
        }
      />
      <View style={styles.tabsBlock}>
        <PillTabs items={TABS} value={tab} progress={pageProgress} onChange={selectTab} />
      </View>
      <PeriodSwitcher
        period={period}
        offset={offset}
        customRange={customRange}
        onPeriodChange={setPeriod}
        onOffsetChange={setOffset}
        onCustomRangeChange={setCustomRange}
      />
    </View>
  );

  const pageBody = (body: ReactNode) => (
    <ScrollView
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      directionalLockEnabled
      style={[styles.pageScroll, webPanY]}
      keyboardShouldPersistTaps="handled">
      {body}
    </ScrollView>
  );

  return (
    <AppScreen>
      {chrome}
      <View
        style={styles.pagerHost}
        onLayout={(e) => {
          const w = Math.round(e.nativeEvent.layout.width);
          const h = Math.round(e.nativeEvent.layout.height);
          if (w > 0 && w !== pagerWidth) setPagerWidth(w);
          if (h > 0 && h !== pagerHeight) setPagerHeight(h);
        }}>
        <InsightsTabPager
          ref={pagerRef}
          width={width}
          height={pagerHeight}
          onProgressChange={onProgressChange}
          onPageSettled={onPageSettled}>
          {pageBody(<OverviewPanel data={data} />)}
          {pageBody(<TransactionsPanel data={data} rangeLabel={rangeLabel} />)}
          {pageBody(<BillsPanel liquidCash={data.advisor.liquidCash} />)}
          {pageBody(
            <SubscriptionsPanel subscriptions={subscriptions} earned={data.earned} />,
          )}
        </InsightsTabPager>
      </View>
    </AppScreen>
  );
}

type Data = ReturnType<typeof getInsightsForPeriod>;

function OverviewPanel({ data }: { data: Data }) {
  const router = useRouter();
  const [breakdown, setBreakdown] = useState<BreakdownKey>('categories');
  const askUdara = () => openUdaraChat(router);

  return (
    <View style={styles.stack}>
      <SpendHero
        left={data.left}
        spent={data.spent}
        budgeted={data.budgeted}
        overBy={data.overBy}
        series={data.spendSeries}
      />

      <View>
        <SectionHeader title="POSITION" />
        <AdvisorBreakdown metrics={data.advisor} />
      </View>

      <View>
        <SectionHeader title="INCOME" />
        <StatStrip
          items={[
            {
              value: formatNaira(data.earned),
              label: 'earned so far',
              tone: data.earned > 0 ? 'strong' : 'watch',
            },
            {
              value: formatNaira(data.earnedLast),
              label: 'last period',
              tone: 'stable',
            },
          ]}
        />
      </View>

      <View style={styles.breakdownBlock}>
        <BreakdownTabs value={breakdown} onChange={setBreakdown} />
        {breakdown === 'categories' ? (
          data.categories.length === 0 ? (
            <EmptyState
              icon="grid-outline"
              title="No categories yet"
              body="Once money moves, Udara groups spend into categories so you can see where it went."
              actionLabel="Ask Udara"
              onAction={askUdara}
            />
          ) : (
            <LiquidGlass style={styles.glassList} intensity={45} contentStyle={styles.plainList}>
              {data.categories.map((c) => {
                const meta = CATEGORY_META[c.name];
                return (
                  <View key={c.name} style={styles.plainRow}>
                    <View
                      style={[
                        styles.glyph,
                        { borderColor: meta?.tint ?? AppTheme.borderStrong },
                      ]}>
                      <Text style={styles.glyphEmoji}>{meta?.icon ?? '●'}</Text>
                    </View>
                    <View style={styles.plainCopy}>
                      <Text style={styles.plainTitle}>{meta?.label ?? c.name}</Text>
                      <Text style={styles.plainSub}>
                        {c.count} transaction{c.count === 1 ? '' : 's'}
                      </Text>
                    </View>
                    <Text style={styles.plainAmtMuted}>{formatNaira(c.amount)}</Text>
                  </View>
                );
              })}
            </LiquidGlass>
          )
        ) : (
          <LeaderboardList
            hint="Ranked by how much you sent them"
            total={data.spent}
            empty={
              <EmptyState
                icon="people-outline"
                title="No recipients yet"
                body="Transfers and payments will rank here so you can see who gets the most of your money."
                actionLabel="Ask Udara"
                onAction={askUdara}
              />
            }
            items={data.recipients.map((r) => ({
              id: r.name,
              title: r.name,
              subtitle: `${r.count} payment${r.count === 1 ? '' : 's'}`,
              amount: r.amount,
            }))}
          />
        )}
      </View>
    </View>
  );
}

function TransactionsPanel({ data, rangeLabel }: { data: Data; rangeLabel: string }) {
  const router = useRouter();
  const [rail, setRail] = useState<'all' | 'review'>('all');
  const list =
    rail === 'review' ? data.txns.filter((t) => t.needsReview) : data.txns;
  const spendTone = toneFromSpend(data.spent, data.budgeted);
  const reviewTone = toneFromReviewCount(data.toReview.length);

  return (
    <View style={styles.stack}>
      <InsightHero
        amount={formatNaira(data.spent)}
        caption="spent this period"
        hint={rangeLabel}
        tone={spendTone}
      />
      <StatStrip
        items={[
          { value: formatNaira(data.spent), label: 'out', tone: spendTone },
          {
            value: formatNaira(data.earned),
            label: 'in',
            tone: data.earned > 0 ? 'strong' : 'watch',
          },
          {
            value: String(data.toReview.length),
            label: 'to review',
            tone: reviewTone,
          },
        ]}
      />
      <View style={styles.breakdownBlock}>
        <SegmentRail items={TX_RAIL} value={rail} onChange={setRail} />
        {list.length === 0 ? (
          rail === 'review' ? (
            <EmptyState
              tone="positive"
              icon="checkmark-circle-outline"
              title="You're all caught up"
              body="Nothing needs review right now. New transfers that look unclear will show up here."
            />
          ) : (
            <EmptyState
              icon="swap-horizontal-outline"
              title="No transactions yet"
              body="When you spend, transfer, or get paid, every move will land in this list for the period you pick."
              actionLabel="Ask Udara"
              onAction={() => openUdaraChat(router)}
            />
          )
        ) : (
          <LiquidGlass style={styles.glassList} intensity={45} contentStyle={styles.listCard}>
            {list.map((t, i) => (
              <View key={t.id}>
                {i > 0 ? <View style={styles.divider} /> : null}
                <TransactionRow transaction={t} />
              </View>
            ))}
          </LiquidGlass>
        )}
      </View>
    </View>
  );
}

function BillsPanel({ liquidCash }: { liquidCash: number }) {
  const router = useRouter();
  const [rail, setRail] = useState<'ranking' | 'upcoming'>('ranking');
  const stats = useMemo(() => buildBillStats(MockUpcomingFromBills), []);
  const dueTone = toneFromBillsDue(stats.total, liquidCash);

  if (MockUpcomingFromBills.length === 0) {
    return (
      <EmptyState
        icon="receipt-outline"
        title="No bills on the board"
        body="Add electricity, rent, and other recurring bills so Udara can rank what you owe and nudge you before due dates."
        actionLabel="Ask Udara to add a bill"
        onAction={() => openUdaraChat(router, 'I want to add a bill')}
      />
    );
  }

  return (
    <View style={styles.stack}>
      <InsightHero
        amount={formatNaira(stats.total)}
        caption="due across your bills"
        hint={stats.next ? `Next up · ${stats.next.name} ${stats.next.due}` : undefined}
        tone={dueTone}
      />
      <StatStrip
        items={[
          { value: String(stats.count), label: 'bills', tone: 'stable' },
          { value: formatNaira(stats.avg), label: 'avg bill', tone: dueTone },
          {
            value: stats.next?.due ?? '—',
            label: 'next due',
            tone: stats.next ? 'watch' : 'stable',
          },
        ]}
      />
      <View style={styles.breakdownBlock}>
        <SegmentRail items={BILL_RAIL} value={rail} onChange={setRail} />
        {rail === 'ranking' ? (
          <LeaderboardList
            hint="Ranked by how much each bill costs"
            total={stats.total}
            empty={
              <EmptyState
                icon="podium-outline"
                title="Nothing to rank"
                body="Once bills are on your list, they’ll stack here from biggest to smallest."
              />
            }
            items={stats.ranking.map((b) => ({
              id: b.id,
              title: b.name,
              subtitle: b.provider ? `${b.provider} · ${b.cadence}` : b.cadence,
              amount: b.amount,
            }))}
          />
        ) : (
          <LiquidGlass style={styles.glassList} intensity={45} contentStyle={styles.plainList}>
            {stats.upcoming.map((b) => (
              <View key={b.id} style={styles.plainRow}>
                <View style={[styles.glyph, { borderColor: AppTheme.borderStrong }]}>
                  <Text style={styles.glyphEmoji}>📅</Text>
                </View>
                <View style={styles.plainCopy}>
                  <Text style={styles.plainTitle}>{b.name}</Text>
                  <Text style={styles.plainSub}>
                    {b.provider ? `${b.provider} · ` : ''}Due {b.due}
                  </Text>
                </View>
                <Text style={styles.plainAmt}>{formatNaira(b.amount)}</Text>
              </View>
            ))}
          </LiquidGlass>
        )}
      </View>
    </View>
  );
}

function SubscriptionsPanel({
  subscriptions,
  earned,
}: {
  subscriptions: MockSubscription[];
  earned: number;
}) {
  const router = useRouter();
  const askToAddSubscription = () => {
    openUdaraChat(router, 'I want to add a subscription');
  };
  const [rail, setRail] = useState<'all' | 'active' | 'upcoming' | 'rank'>('all');
  const stats = useMemo(() => buildSubscriptionStats(subscriptions), [subscriptions]);
  const burnTone = toneFromSubscriptionBurn(stats.total, earned);
  const activeSubs = useMemo(
    () => subscriptions.filter((s) => s.active !== false),
    [subscriptions],
  );

  const openSubscription = (id: string) => {
    router.push(`/(app)/subscription/${id}`);
  };

  const renderSubRow = (s: MockSubscription) => (
    <Pressable
      key={s.id}
      onPress={() => openSubscription(s.id)}
      style={({ pressed }) => [styles.plainRow, pressed && styles.plainRowPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${s.name}, ${formatNaira(s.amount)}`}>
      <View style={[styles.glyph, { borderColor: '#ec4899' }]}>
        <Text style={styles.glyphLetter}>{s.name.slice(0, 1)}</Text>
      </View>
      <View style={styles.plainCopy}>
        <Text style={styles.plainTitle}>{s.name}</Text>
        <Text style={styles.plainSub}>
          {s.company} · {s.cadence}
          {s.startDate ? ` · since ${formatDisplayDate(s.startDate)}` : ''}
          {s.active === false ? ' · paused' : ''}
        </Text>
      </View>
      <Text style={styles.plainAmtMuted}>{formatNaira(s.amount)}</Text>
      <Ionicons name="chevron-forward" size={16} color={AppTheme.textFaint} />
    </Pressable>
  );

  if (subscriptions.length === 0) {
    return (
      <View>
        <EmptyState
          icon="albums-outline"
          title="Add a subscription to start"
          body="Track Netflix, DStv, and other recurring apps here — spend, renewals, and the companies behind them."
          actionLabel="Add subscription"
          onAction={askToAddSubscription}
        />
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <InsightHero
        amount={formatNaira(stats.total)}
        caption="on subscriptions this period"
        hint={`${stats.count} app${stats.count === 1 ? '' : 's'} · ${stats.renewalsSoon} renewing soon`}
        tone={burnTone}
      />
      <StatStrip
        items={[
          { value: String(stats.count), label: 'apps', tone: 'stable' },
          {
            value: String(stats.renewalsSoon),
            label: 'renewing soon',
            tone: stats.renewalsSoon > 0 ? 'watch' : 'strong',
          },
          {
            value: formatNaira(stats.avg),
            label: 'avg / app',
            tone: burnTone,
          },
        ]}
      />

      <View style={styles.breakdownBlock}>
        <SegmentRail items={SUB_RAIL} value={rail} onChange={setRail} />
        {rail === 'all' ? (
          <LiquidGlass style={styles.glassList} intensity={45} contentStyle={styles.plainList}>
            {subscriptions.map(renderSubRow)}
          </LiquidGlass>
        ) : null}
        {rail === 'active' ? (
          activeSubs.length === 0 ? (
            <EmptyState
              icon="play-circle-outline"
              title="No active subscriptions"
              body="Active plans show here. Add one or resume a paused app to fill this list."
              actionLabel="Add subscription"
              onAction={askToAddSubscription}
            />
          ) : (
            <LiquidGlass style={styles.glassList} intensity={45} contentStyle={styles.plainList}>
              {activeSubs.map(renderSubRow)}
            </LiquidGlass>
          )
        ) : null}
        {rail === 'upcoming' ? (
          <LiquidGlass style={styles.glassList} intensity={45} contentStyle={styles.plainList}>
            {stats.upcoming.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => openSubscription(s.id)}
                style={({ pressed }) => [styles.plainRow, pressed && styles.plainRowPressed]}
                accessibilityRole="button"
                accessibilityLabel={`${s.name} renews ${s.nextRenewal}`}>
                <View style={[styles.glyph, { borderColor: '#ec4899' }]}>
                  <Text style={styles.glyphEmoji}>↻</Text>
                </View>
                <View style={styles.plainCopy}>
                  <Text style={styles.plainTitle}>{s.name}</Text>
                  <Text style={styles.plainSub}>Renews {s.nextRenewal}</Text>
                </View>
                <Text style={styles.plainAmtMuted}>{formatNaira(s.amount)}</Text>
                <Ionicons name="chevron-forward" size={16} color={AppTheme.textFaint} />
              </Pressable>
            ))}
          </LiquidGlass>
        ) : null}
        {rail === 'rank' ? (
          <LeaderboardList
            hint="Ranked by what you pay each period"
            total={stats.total}
            onItemPress={(item) => openSubscription(item.id)}
            empty={
              <EmptyState
                icon="podium-outline"
                title="Nothing to rank"
                body="Subscriptions you add will rank here from highest spend to lowest."
                actionLabel="Add subscription"
                onAction={askToAddSubscription}
              />
            }
            items={[...subscriptions]
              .sort((a, b) => b.amount - a.amount)
              .map((s) => ({
                id: s.id,
                title: s.name,
                subtitle: `${s.company} · ${s.cadence}`,
                amount: s.amount,
              }))}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chrome: {
    paddingBottom: 4,
  },
  tabsBlock: {
    marginTop: 2,
    marginBottom: 6,
  },
  pagerHost: { flex: 1 },
  pageScroll: { flex: 1 },
  pageContent: {
    paddingHorizontal: AppTheme.edgePadH,
    paddingTop: 8,
    paddingBottom: 40 + TAB_BAR_SCROLL_INSET,
  },
  stack: { gap: 12 },
  breakdownBlock: { gap: 8 },
  glassList: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppTheme.border,
  },
  plainList: {
    gap: 2,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  plainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
  },
  plainRowPressed: {
    opacity: 0.72,
  },
  glyph: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  glyphEmoji: { fontSize: 14 },
  glyphLetter: {
    color: AppTheme.text,
    fontSize: 13,
    fontFamily: FontFamily.semibold,
  },
  plainCopy: { flex: 1, minWidth: 0 },
  plainTitle: {
    color: AppTheme.text,
    fontSize: 13,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.2,
  },
  plainSub: {
    color: AppTheme.textFaint,
    fontSize: 10,
    fontFamily: FontFamily.regular,
    marginTop: 1,
    lineHeight: 14,
  },
  plainAmt: {
    color: AppTheme.text,
    fontSize: 13,
    fontFamily: FontFamily.semibold,
  },
  plainAmtMuted: {
    color: AppTheme.textMuted,
    fontSize: 13,
    fontFamily: FontFamily.medium,
  },
  listCard: {
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AppTheme.border,
  },
  empty: {
    color: AppTheme.textMuted,
    fontSize: 14,
    fontFamily: FontFamily.regular,
    paddingVertical: 16,
  },
  cta: {
    backgroundColor: AppTheme.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaPressed: { opacity: 0.85 },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FontFamily.semibold,
  },
});
