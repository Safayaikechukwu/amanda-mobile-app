import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppScreen } from '@/components/app/AppScreen';
import { TAB_BAR_SCROLL_INSET } from '@/components/app/AppTabBar';
import { AnimatedSavingsRing } from '@/components/savings/AnimatedSavingsRing';
import { QuickSaveSheet } from '@/components/savings/QuickSaveSheet';
import { GlassPressable } from '@/components/ui/GlassPressable';
import { MoneyMovementRow } from '@/components/ui/MoneyMovementRow';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { savingsHomeIntroOnFocus } from '@/helpers/savingsHomeIntro';
import {
  MockRecentSaves,
  MockSavingsBuckets,
  type SavingsBucket,
  type SavingsBucketId,
} from '@/constants/MockData';
import { SavingsBucketTheme } from '@/constants/SavingsTheme';
import { formatNaira } from '@/constants/MockInsights';
import {
  movementSubtitle,
  resolveSavingsStatus,
} from '@/constants/TransactionStatus';
import {
  setLiveRecentSaves,
  setLiveSavingsBuckets,
} from '@/constants/SavingsActivity';
import { usePreferences } from '@/context/PreferencesContext';

const enter = (delay: number) =>
  FadeInDown.delay(delay).duration(520).springify().damping(20).stiffness(180);

function IntroBlock({
  animate,
  delay,
  style,
  children,
}: {
  animate: boolean;
  delay: number;
  style?: object;
  children: ReactNode;
}) {
  if (!animate) {
    return <View style={style}>{children}</View>;
  }
  return (
    <Animated.View entering={enter(delay)} style={style}>
      {children}
    </Animated.View>
  );
}

function BucketCard({
  bucket,
  onPress,
  formatAmount,
}: {
  bucket: SavingsBucket;
  onPress: () => void;
  formatAmount: (amount: number) => string;
}) {
  const theme = SavingsBucketTheme[bucket.id];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.bucketCell, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${bucket.title}, ${formatNaira(bucket.amount)}`}>
      <View style={[styles.bucketCard, { backgroundColor: theme.surface }]}>
        <View style={styles.bucketHead}>
          <View style={[styles.bucketIcon, { backgroundColor: theme.iconBg }]}>
            <Ionicons name={bucket.icon} size={15} color={theme.accent} />
          </View>
          <Text style={styles.bucketTitle} numberOfLines={1}>
            {bucket.title}
          </Text>
        </View>
        <Text
          style={styles.bucketAmt}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}>
          {formatAmount(bucket.amount)}
        </Text>
      </View>
    </Pressable>
  );
}

export default function SavingsScreen() {
  const router = useRouter();
  const { formatAmount } = usePreferences();
  const [buckets, setBuckets] = useState(MockSavingsBuckets);
  const [recent, setRecent] = useState(MockRecentSaves);
  const [quickOpen, setQuickOpen] = useState(false);
  const skipNextFocusIntro = useRef(true);
  const [playIntro, setPlayIntro] = useState(() => savingsHomeIntroOnFocus());

  useFocusEffect(
    useCallback(() => {
      if (skipNextFocusIntro.current) {
        skipNextFocusIntro.current = false;
        return;
      }
      setPlayIntro(savingsHomeIntroOnFocus());
    }, []),
  );

  useEffect(() => {
    setLiveRecentSaves(recent);
    setLiveSavingsBuckets(buckets);
  }, [recent, buckets]);

  const openActivity = (activityId: string) => {
    router.push(`/(app)/savings/activity/${activityId}`);
  };

  const openBucket = (id: SavingsBucketId) => {
    router.push(`/(app)/savings/${id}`);
  };

  const applySave = ({ amount, bucketId }: { amount: number; bucketId: SavingsBucketId }) => {
    if (amount <= 0) return;
    const bucket = MockSavingsBuckets.find((b) => b.id === bucketId);
    setBuckets((prev) =>
      prev.map((b) => (b.id === bucketId ? { ...b, amount: b.amount + amount } : b)),
    );
    setRecent((prev) => [
      {
        id: `r-${Date.now()}`,
        label: `Quick Save → ${bucket?.title ?? 'Savings'}`,
        amount,
        when: 'Just now',
        status: 'successful',
        direction: 'in',
        bucketId,
      },
      ...prev,
    ]);
    setQuickOpen(false);
  };

  return (
    <AppScreen
      title="Savings"
      headerVariant="large">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <AnimatedSavingsRing
            buckets={buckets}
            formatAmount={formatAmount}
            animate={playIntro}
          />

          <IntroBlock animate={playIntro} delay={280} style={styles.stashWrap}>
            <GlassPressable
              label="Quick Save"
              onPress={() => setQuickOpen(true)}
              style={styles.stashBtn}
              accessibilityLabel="Quick Save"
            />
          </IntroBlock>

          <IntroBlock animate={playIntro} delay={360} style={styles.stretch}>
            <View style={styles.bucketList}>
              {buckets.map((b) => (
                <BucketCard
                  key={b.id}
                  bucket={b}
                  onPress={() => openBucket(b.id)}
                  formatAmount={formatAmount}
                />
              ))}
            </View>
          </IntroBlock>

          <IntroBlock animate={playIntro} delay={440} style={styles.stretch}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Recent saves</Text>
              <Pressable
                onPress={() => router.push('/(app)/savings/activity')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="See all recent saves">
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>
            <LiquidGlass style={styles.recentCard} intensity={40} contentStyle={styles.recentInner}>
              {recent.slice(0, 5).map((item, i, arr) => {
                const status = resolveSavingsStatus(item);
                return (
                  <View
                    key={item.id}
                    style={[styles.recentRowWrap, i < arr.length - 1 && styles.recentRowBorder]}>
                    <MoneyMovementRow
                      title={item.label}
                      subtitle={movementSubtitle([item.when], status)}
                      amount={item.amount}
                      status={status}
                      direction={item.direction ?? 'in'}
                      avatarLetter={item.label}
                      onPress={() => openActivity(item.id)}
                    />
                  </View>
                );
              })}
            </LiquidGlass>
          </IntroBlock>
        </ScrollView>

      <QuickSaveSheet
        visible={quickOpen}
        onClose={() => setQuickOpen(false)}
        onSave={applySave}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: AppTheme.edgePadH,
    paddingTop: 18,
    paddingBottom: 40 + TAB_BAR_SCROLL_INSET,
    alignItems: 'center',
  },
  stretch: {
    alignSelf: 'stretch',
  },
  stashWrap: {
    alignSelf: 'stretch',
    marginTop: 4,
  },
  stashBtn: {
    marginBottom: 16,
  },
  sectionHead: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.25,
  },
  seeAll: {
    color: AppTheme.accent,
    fontSize: 12,
    fontFamily: FontFamily.medium,
    textDecorationLine: 'underline',
  },
  bucketList: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  bucketCell: {
    width: '48%',
    flexGrow: 1,
    minWidth: '47%',
  },
  bucketCard: {
    borderRadius: 16,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 10,
  },
  bucketHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bucketIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bucketTitle: {
    flex: 1,
    color: AppTheme.text,
    fontSize: 13,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.2,
  },
  bucketAmt: {
    color: AppTheme.text,
    fontSize: 17,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.35,
  },
  recentCard: {
    alignSelf: 'stretch',
    borderRadius: 14,
    boxShadow: '0 8px 24px rgba(13,13,13,0.05)',
    elevation: 2,
  },
  recentInner: { paddingVertical: 2, paddingHorizontal: 14 },
  recentRowWrap: {
    paddingHorizontal: 2,
  },
  recentRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(13,13,13,0.08)',
  },
  pressed: { opacity: 0.85 },
});
