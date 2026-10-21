import { Redirect, useLocalSearchParams } from 'expo-router';

import { TransactionReceiptScreen } from '@/components/insights/TransactionReceiptScreen';
import { useAuth } from '@/context/AuthContext';
import {
  buildReceiptForTransaction,
  getTransactionById,
} from '@/constants/MockInsights';

export default function ReceiptRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const txn = id ? getTransactionById(id) : undefined;

  if (!txn) {
    return <Redirect href="/(app)/insights" />;
  }

  const receipt = buildReceiptForTransaction(txn, user?.name ?? 'Ikechukwu Ndubueze');

  return <TransactionReceiptScreen receipt={receipt} />;
}
