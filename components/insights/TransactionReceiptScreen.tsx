import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { CloseIconButton } from '@/components/ui/CloseIconButton';
import { GlassPressable } from '@/components/ui/GlassPressable';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { shareTransactionReceipt } from '@/helpers/shareReceipt';
import { SUPPORT_EMAIL } from '@/helpers/support';
import {
  formatNaira,
  formatReceiptShareText,
  type TransactionReceipt,
} from '@/constants/MockInsights';

type Props = {
  receipt: TransactionReceipt;
};

function PerforatedEdge() {
  return (
    <View style={styles.perforatedWrap} accessibilityElementsHidden importantForAccessibility="no">
      {Array.from({ length: 36 }).map((_, i) => (
        <View key={i} style={styles.perforatedDot} />
      ))}
    </View>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function TransactionReceiptScreen({ receipt }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cardRef = useRef<View>(null);
  const sharingRef = useRef(false);

  const onShare = async () => {
    if (sharingRef.current) return;
    sharingRef.current = true;
    const message = formatReceiptShareText(receipt);

    try {
      await shareTransactionReceipt(cardRef, message);
    } catch {
      try {
        await Share.share({ message, title: 'Transaction Receipt' });
      } catch {
        /* user dismissed */
      }
    } finally {
      sharingRef.current = false;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 16) + 12 },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <CloseIconButton
            onPress={() => router.back()}
            variant="plain"
            size={26}
            style={styles.iconBtn}
          />
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.titleRow}>
          <Image
            source={require('../../assets/images/udara-mark-white.png')}
            style={styles.brandMark}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <Text style={styles.title}>Transaction Receipt</Text>
        </View>

        <View ref={cardRef} collapsable={false} style={styles.cardOuter}>
          <View style={styles.card}>
            <View style={styles.amountBlock}>
              <Text style={styles.amount}>{formatNaira(receipt.amount)}</Text>
            </View>

            <PerforatedEdge />

            <View style={styles.detailsBlock}>
              <ReceiptRow label="Date" value={receipt.dateLabel} />
              <ReceiptRow label="Sender" value={receipt.sender} />
              <ReceiptRow label="Recipient" value={receipt.recipient} />
              {receipt.recipientBank ? (
                <ReceiptRow label="Recipient bank" value={receipt.recipientBank} />
              ) : null}
              {receipt.recipientAccount ? (
                <ReceiptRow label="Recipient account" value={receipt.recipientAccount} />
              ) : null}
              <ReceiptRow label="Reference" value={receipt.reference} />
              <ReceiptRow label="Session ID" value={receipt.sessionId} />
            </View>

            <View style={styles.supportBox}>
              <Text style={styles.supportLabel}>For support and enquiries:</Text>
              <Text style={styles.supportEmail}>{SUPPORT_EMAIL}</Text>
            </View>
          </View>
        </View>

        <GlassPressable
          label="Share receipt"
          onPress={() => void onShare()}
          variant="ghost"
          style={styles.shareBtn}
          accessibilityLabel="Share receipt"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppTheme.accent,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  topBarSpacer: { flex: 1 },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 12,
  },
  brandMark: {
    width: 72,
    height: 28,
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontFamily: FontFamily.medium,
    letterSpacing: -0.2,
  },
  cardOuter: {
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
      },
      android: { elevation: 10 },
      default: {},
    }),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  amountBlock: {
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  amount: {
    color: AppTheme.text,
    fontSize: 40,
    fontFamily: FontFamily.bold,
    letterSpacing: -1,
  },
  perforatedWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginTop: -6,
    marginBottom: -6,
    overflow: 'hidden',
  },
  perforatedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppTheme.accent,
    marginHorizontal: 1,
  },
  detailsBlock: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 8,
    gap: 18,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  detailLabel: {
    flex: 0.42,
    color: AppTheme.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FontFamily.regular,
  },
  detailValue: {
    flex: 0.58,
    color: AppTheme.text,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FontFamily.medium,
    textAlign: 'right',
  },
  supportBox: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(74, 5, 8, 0.07)',
    gap: 4,
  },
  supportLabel: {
    color: AppTheme.textMuted,
    fontSize: 13,
    fontFamily: FontFamily.regular,
  },
  supportEmail: {
    color: AppTheme.accent,
    fontSize: 14,
    fontFamily: FontFamily.semibold,
  },
  shareBtn: {
    marginTop: 28,
  },
});
