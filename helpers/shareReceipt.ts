import * as Sharing from 'expo-sharing';
import { Alert, Platform, Share, type View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';

async function shareReceiptOnWeb(dataUri: string, message: string): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('share-unavailable');
  }

  const blob = await (await fetch(dataUri)).blob();
  const file = new File([blob], 'udara-receipt.png', { type: 'image/png' });

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      if (!navigator.canShare || navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Udara Transaction Receipt',
          text: message,
          files: [file],
        });
        return;
      }
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') return;
    }

    try {
      await navigator.share({
        title: 'Udara Transaction Receipt',
        text: message,
      });
      return;
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') return;
    }
  }

  const link = document.createElement('a');
  link.href = dataUri;
  link.download = `udara-receipt-${Date.now()}.png`;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  Alert.alert(
    'Receipt saved',
    'Your receipt was downloaded as an image. Attach it from Downloads if you want to share it.',
  );
}

export async function shareTransactionReceipt(
  cardRef: RefObject<View | null>,
  message: string,
): Promise<void> {
  if (!cardRef.current) {
    throw new Error('missing-ref');
  }

  if (Platform.OS === 'web') {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }

  const uri = await captureRef(cardRef, {
    format: 'png',
    quality: 1,
    result: Platform.OS === 'web' ? 'data-uri' : 'tmpfile',
  });

  if (Platform.OS === 'web') {
    await shareReceiptOnWeb(uri, message);
    return;
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Share receipt',
      UTI: 'public.png',
    });
    return;
  }

  await Share.share({ message, title: 'Transaction Receipt' });
}
