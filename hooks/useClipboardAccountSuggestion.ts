import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { extractAccountNumber } from '@/helpers/clipboardAccount';

type Options = {
  enabled?: boolean;
};

export function useClipboardAccountSuggestion({ enabled = true }: Options = {}) {
  const [accountNumber, setAccountNumber] = useState<string | null>(null);
  const dismissedRef = useRef<string | null>(null);

  const check = useCallback(async () => {
    if (!enabled) {
      setAccountNumber(null);
      return;
    }

    try {
      const raw = await Clipboard.getStringAsync();
      const account = extractAccountNumber(raw);
      if (account && account !== dismissedRef.current) {
        setAccountNumber(account);
        return;
      }
      if (!account) {
        setAccountNumber(null);
      }
    } catch {
      setAccountNumber(null);
    }
  }, [enabled]);

  useEffect(() => {
    void check();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void check();
    });
    return () => sub.remove();
  }, [check]);

  const dismiss = useCallback(() => {
    if (accountNumber) dismissedRef.current = accountNumber;
    setAccountNumber(null);
  }, [accountNumber]);

  const apply = useCallback(async () => {
    try {
      const raw = await Clipboard.getStringAsync();
      const account = extractAccountNumber(raw);
      if (account && account !== dismissedRef.current) {
        setAccountNumber(account);
        return account;
      }
    } catch {
      /* ignore */
    }
    return accountNumber;
  }, [accountNumber]);

  return { accountNumber, dismiss, refresh: check, applyFromClipboard: apply };
}
