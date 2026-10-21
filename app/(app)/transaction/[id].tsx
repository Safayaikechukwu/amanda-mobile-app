import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { BackIconButton } from '@/components/ui/BackIconButton';
import { GlassPressable } from '@/components/ui/GlassPressable';
import { Text } from '@/components/ui/Text';
import { formatAccountNumber } from '@/helpers/clipboardAccount';
import {
  CATEGORY_META,
  buildReceiptForTransaction,
  formatDisplayDate,
  getTransactionById,
  type InsightTransaction,
} from '@/constants/MockInsights';
import {
  STATUS_META,
  formatMovementAmount,
  resolveTransactionStatus,
  type MoneyMovementStatus,
} from '@/constants/TransactionStatus';

function txnTypeLabel(txn: InsightTransaction): string {
  if (txn.amount < 0) return 'Incoming payment';
  if (/transfer/i.test(txn.merchant)) return 'Bank transfer';
  return 'Card payment';
}

function statusMessage(status: MoneyMovementStatus): string | null {
  switch (status) {
    case 'failed':
      return "This transfer couldn't be completed. Your account wasn't debited — you can try again.";
    case 'pending':
      return "We're processing this transfer. You'll get a notification when it's done.";
    default:
      return null;
  }
}

function StatusPill({ status }: { status: MoneyMovementStatus }) {
  const meta = STATUS_META[status];
  return (
    <View style={[styles.statusPill, { backgroundColor: meta.avatarBg }]}>
      <View style={[styles.statusDot, { backgroundColor: meta.dotColor }]} />
      <Text style={[styles.statusPillText, { color: meta.avatarText }]}>{meta.label}</Text>
    </View>
  );
}

function DetailRow({
  label,
  value,
  last,
  mono,
}: {
  label: string;
  value: string;
  last?: boolean;
  mono?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, mono && styles.rowValueMono]} selectable>
        {value}
      </Text>
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

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const txn = id ? getTransactionById(id) : undefined;

  if (!txn) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <Text style={styles.missingTitle}>Transaction not found</Text>
        <Pressable onPress={() => router.back()} style={styles.missingBtn}>
          <Text style={styles.missingBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const inflow = txn.amount < 0;
  const meta = CATEGORY_META[txn.category];
  const absAmount = Math.abs(txn.amount);
  const status = resolveTransactionStatus(txn);
  const statusMeta = STATUS_META[status];
  const amountFmt = formatMovementAmount(absAmount, status, inflow ? 'in' : 'out');
  const receipt = buildReceiptForTransaction(txn);
  const banner = statusMessage(status);
  const isTransfer = /transfer/i.test(txn.merchant);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <View style={styles.nav}>
        <BackIconButton onPress={() => router.back()} accessibilityLabel="Back" />
        <Text style={styles.navTitle} numberOfLines={1}>
          Transaction
        </Text>
        <View style={styles.navSide} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 16) + 88 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.avatar, { backgroundColor: statusMeta.avatarBg, borderColor: `${statusMeta.dotColor}33` }]}>
            <Text style={[styles.avatarText, { color: statusMeta.avatarText }]}>
              {txn.merchant.slice(0, 1)}
            </Text>
          </View>
          <Text style={styles.merchant}>{txn.merchant}</Text>
          <Text style={styles.typeLabel}>{txnTypeLabel(txn)}</Text>
          <Text
            style={[
              styles.amount,
              { color: amountFmt.color },
              amountFmt.struck && styles.amountFailed,
            ]}>
            {amountFmt.text}
          </Text>
          <StatusPill status={status} />
          <Text style={styles.dateLine}>{receipt.dateLabel}</Text>
        </View>

        {banner ? (
          <View
            style={[
              styles.banner,
              status === 'failed' ? styles.bannerFailed : styles.bannerPending,
            ]}>
            <Ionicons
              name={status === 'failed' ? 'alert-circle-outline' : 'time-outline'}
              size={18}
              color={status === 'failed' ? '#DC2626' : '#D97706'}
            />
            <Text
              style={[
                styles.bannerText,
                status === 'failed' ? styles.bannerTextFailed : styles.bannerTextPending,
              ]}>
              {banner}
            </Text>
          </View>
        ) : null}

        <DetailSection title="Overview">
          <DetailRow label="Category" value={meta?.label ?? txn.category} />
          <DetailRow label="Type" value={txnTypeLabel(txn)} />
          <DetailRow label="Date" value={formatDisplayDate(txn.date)} last />
        </DetailSection>

        {isTransfer || inflow ? (
          <DetailSection title={inflow ? 'Received from' : 'Sent to'}>
            <DetailRow label={inflow ? 'Sender' : 'Recipient'} value={inflow ? receipt.sender : receipt.recipient} />
            {receipt.recipientBank ? (
              <DetailRow label="Bank" value={receipt.recipientBank} />
            ) : null}
            {receipt.recipientAccount ? (
              <DetailRow
                label="Account"
                value={formatAccountNumber(receipt.recipientAccount)}
                mono
                last
              />
            ) : (
              <DetailRow label="Account" value="—" last />
            )}
          </DetailSection>
        ) : (
          <DetailSection title="Merchant">
            <DetailRow label="Name" value={txn.merchant} />
            <DetailRow label="Category" value={meta?.label ?? txn.category} last />
          </DetailSection>
        )}

        <DetailSection title="Reference">
          <DetailRow label="Reference" value={receipt.reference} mono />
          <DetailRow label="Session ID" value={receipt.sessionId} mono last />
        </DetailSection>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <GlassPressable
          onPress={() => router.push(`/(app)/receipt/${txn.id}`)}
          accessibilityLabel="View receipt">
          <Ionicons name="receipt-outline" size={18} color="#fff" />
          <Text style={styles.receiptBtnText}>View receipt</Text>
        </GlassPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppTheme.bg,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
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
    letterSpacing: -0.2,
  },
  navSide: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 16,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 6,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarText: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
  },
  merchant: {
    color: AppTheme.text,
    fontSize: 20,
    fontFamily: FontFamily.bold,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  typeLabel: {
    color: AppTheme.textMuted,
    fontSize: 14,
    fontFamily: FontFamily.medium,
  },
  amount: {
    fontSize: 36,
    fontFamily: FontFamily.bold,
    letterSpacing: -1,
    marginTop: 4,
  },
  amountFailed: {
    textDecorationLine: 'line-through',
    opacity: 0.75,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 13,
    fontFamily: FontFamily.semibold,
  },
  dateLine: {
    color: AppTheme.textMuted,
    fontSize: 13,
    fontFamily: FontFamily.regular,
    marginTop: 2,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 14,
  },
  bannerFailed: {
    backgroundColor: 'rgba(220,38,38,0.08)',
  },
  bannerPending: {
    backgroundColor: 'rgba(217,119,6,0.1)',
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FontFamily.medium,
  },
  bannerTextFailed: { color: '#B91C1C' },
  bannerTextPending: { color: '#B45309' },
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 16,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppTheme.border,
  },
  rowLabel: {
    color: AppTheme.textMuted,
    fontSize: 15,
    fontFamily: FontFamily.regular,
    paddingTop: 1,
  },
  rowValue: {
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.semibold,
    textAlign: 'right',
    flex: 1,
    letterSpacing: -0.1,
  },
  rowValueMono: {
    fontFamily: FontFamily.medium,
    letterSpacing: 0.3,
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
  receiptBtnText: {
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
