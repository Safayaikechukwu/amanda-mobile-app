import { useRouter } from 'expo-router';

import { MoneyMovementRow } from '@/components/ui/MoneyMovementRow';
import {
  movementSubtitle,
  resolveTransactionStatus,
} from '@/constants/TransactionStatus';
import { type InsightTransaction } from '@/constants/MockInsights';

type Props = {
  transaction: InsightTransaction;
  onPress?: () => void;
};

export function TransactionRow({ transaction: t, onPress }: Props) {
  const router = useRouter();
  const status = resolveTransactionStatus(t);
  const subtitle = movementSubtitle(
    [t.category, t.needsReview ? 'needs review' : ''].filter(Boolean),
    status,
  );

  return (
    <MoneyMovementRow
      title={t.merchant}
      subtitle={subtitle}
      amount={t.amount}
      status={status}
      direction={t.amount < 0 ? 'in' : 'out'}
      avatarLetter={t.merchant}
      onPress={onPress ?? (() => router.push(`/(app)/transaction/${t.id}`))}
    />
  );
}
