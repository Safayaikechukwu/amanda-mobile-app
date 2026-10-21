import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { UdaraMarkIcon, UDARA_MARK_BUTTON_SIZE } from '@/components/icons/UdaraMarkIcon';
import { BackIconButton } from '@/components/ui/BackIconButton';
import { GlassPressable } from '@/components/ui/GlassPressable';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import {
  annualizedSubscriptionCost,
  cadenceLabel,
  formatDisplayDate,
  formatNaira,
  getSubscriptionById,
} from '@/constants/MockInsights';
import { openUdaraChat } from '@/helpers/openUdaraChat';

function DetailRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sub = id ? getSubscriptionById(id) : undefined;

  if (!sub) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <Text style={styles.missingTitle}>Subscription not found</Text>
        <Pressable onPress={() => router.back()} style={styles.missingBtn}>
          <Text style={styles.missingBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const active = sub.active !== false;
  const yearly = annualizedSubscriptionCost(sub.amount, sub.cadence);

  const askUdara = () => {
    openUdaraChat(router, `Tell me about my ${sub.name} subscription`);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <View style={styles.nav}>
        <BackIconButton onPress={() => router.back()} accessibilityLabel="Back" />
        <Text style={styles.navTitle} numberOfLines={1}>
          Subscription
        </Text>
        <View style={styles.navSide} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 16) + 88 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.glyph, !active && styles.glyphPaused]}>
            <Text style={styles.glyphLetter}>{sub.name.slice(0, 1)}</Text>
          </View>
          <Text style={styles.name}>{sub.name}</Text>
          <Text style={styles.company}>{sub.company}</Text>
          <Text style={styles.amount}>{formatNaira(sub.amount)}</Text>
          <Text style={styles.cadence}>per {sub.cadence === 'yearly' ? 'year' : sub.cadence === 'weekly' ? 'week' : 'month'}</Text>
          <View style={[styles.statusPill, !active && styles.statusPillPaused]}>
            <View style={[styles.statusDot, !active && styles.statusDotPaused]} />
            <Text style={[styles.statusText, !active && styles.statusTextPaused]}>
              {active ? 'Active' : 'Paused'}
            </Text>
          </View>
        </View>

        {!active ? (
          <View style={styles.banner}>
            <Ionicons name="pause-circle-outline" size={18} color="#B45309" />
            <Text style={styles.bannerText}>
              This subscription is paused — you won't be charged until you resume it.
            </Text>
          </View>
        ) : null}

        <DetailSection title="Billing">
          <DetailRow label="Amount" value={formatNaira(sub.amount)} />
          <DetailRow label="Frequency" value={cadenceLabel(sub.cadence)} />
          <DetailRow label="Next renewal" value={sub.nextRenewal} />
          <DetailRow label="Est. yearly" value={formatNaira(yearly)} last />
        </DetailSection>

        <DetailSection title="Details">
          <DetailRow label="Provider" value={sub.company} />
          <DetailRow label="Started" value={formatDisplayDate(sub.startDate)} />
          <DetailRow label="Category" value="Subscriptions" last />
        </DetailSection>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <GlassPressable
          onPress={askUdara}
          accessibilityLabel={`Ask Udara about ${sub.name}`}>
          <UdaraMarkIcon size={UDARA_MARK_BUTTON_SIZE} color="#fff" />
          <Text style={styles.primaryBtnText}>Ask Udara</Text>
        </GlassPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppTheme.bg },
  centered: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
    minHeight: 44,
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    color: AppTheme.text,
    fontSize: 17,
    fontFamily: FontFamily.semibold,
  },
  navSide: { width: 40 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, gap: 16 },
  hero: { alignItems: 'center', paddingVertical: 20, gap: 4 },
  glyph: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#ec4899',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  glyphPaused: { borderColor: AppTheme.borderStrong, opacity: 0.7 },
  glyphLetter: {
    color: AppTheme.text,
    fontSize: 28,
    fontFamily: FontFamily.bold,
  },
  name: {
    color: AppTheme.text,
    fontSize: 24,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  company: {
    color: AppTheme.textMuted,
    fontSize: 15,
    fontFamily: FontFamily.medium,
  },
  amount: {
    color: AppTheme.text,
    fontSize: 34,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.8,
    marginTop: 8,
  },
  cadence: {
    color: AppTheme.textMuted,
    fontSize: 14,
    fontFamily: FontFamily.regular,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(236,72,153,0.12)',
  },
  statusPillPaused: { backgroundColor: 'rgba(217,119,6,0.12)' },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ec4899',
  },
  statusDotPaused: { backgroundColor: '#D97706' },
  statusText: {
    color: '#BE185D',
    fontSize: 13,
    fontFamily: FontFamily.semibold,
  },
  statusTextPaused: { color: '#B45309' },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(217,119,6,0.1)',
  },
  bannerText: {
    flex: 1,
    color: '#B45309',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FontFamily.medium,
  },
  section: { gap: 8 },
  sectionTitle: {
    color: AppTheme.textMuted,
    fontSize: 13,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: AppTheme.track,
    borderRadius: 16,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppTheme.border,
  },
  rowLabel: {
    color: AppTheme.textMuted,
    fontSize: 15,
    fontFamily: FontFamily.regular,
  },
  rowValue: {
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.semibold,
    textAlign: 'right',
    flex: 1,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: AppTheme.edgePadH,
    paddingTop: 12,
    backgroundColor: AppTheme.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AppTheme.border,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FontFamily.semibold,
  },
  missingTitle: {
    color: AppTheme.text,
    fontSize: 17,
    fontFamily: FontFamily.semibold,
    marginBottom: 16,
  },
  missingBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: AppTheme.track,
  },
  missingBtnText: {
    color: AppTheme.accent,
    fontSize: 15,
    fontFamily: FontFamily.semibold,
  },
  pressed: { opacity: 0.82 },
});
