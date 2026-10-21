import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { FontFamily } from '@/constants/Fonts';
import {
  STATUS_META,
  formatMovementAmount,
  type MoneyMovementDirection,
  type MoneyMovementStatus,
} from '@/constants/TransactionStatus';

type Props = {
  title: string;
  subtitle: string;
  amount: number;
  status: MoneyMovementStatus;
  direction?: MoneyMovementDirection;
  avatarLetter?: string;
  avatarBg?: string;
  avatarTextColor?: string;
  formatAmount?: (amount: number) => string;
  onPress?: () => void;
};

export function MoneyMovementRow({
  title,
  subtitle,
  amount,
  status,
  direction,
  avatarLetter,
  avatarBg,
  avatarTextColor,
  formatAmount,
  onPress,
}: Props) {
  const meta = STATUS_META[status];
  const amountFmt = formatMovementAmount(amount, status, direction, formatAmount);
  const letter = (avatarLetter ?? title).trim().charAt(0).toUpperCase() || '?';
  const resolvedAvatarBg = avatarBg ?? meta.avatarBg;
  const resolvedAvatarText = avatarTextColor ?? meta.avatarText;

  const row = (
    <>
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: resolvedAvatarBg }]}>
          <Text style={[styles.avatarText, { color: resolvedAvatarText }]}>{letter}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.subtitle, status !== 'successful' && status !== 'incoming' && { color: meta.dotColor }]}>
            {subtitle}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.amount,
          { color: amountFmt.color },
          amountFmt.struck && styles.amountFailed,
        ]}>
        {amountFmt.text}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${amountFmt.text}`}>
        {row}
      </Pressable>
    );
  }

  return <View style={styles.row}>{row}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 10,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
    minWidth: 0,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontFamily: FontFamily.semibold,
  },
  meta: { flex: 1, minWidth: 0 },
  title: {
    color: '#0d0d0d',
    fontSize: 15,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.2,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 12,
    fontFamily: FontFamily.regular,
    marginTop: 1,
    lineHeight: 16,
  },
  amount: {
    fontSize: 14,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.2,
  },
  amountFailed: {
    textDecorationLine: 'line-through',
    opacity: 0.85,
  },
  pressed: { opacity: 0.78 },
});
