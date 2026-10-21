import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import {
  isExternalLinkScheme,
  isHttpUrl,
  normalizeLinkUrl,
} from '@/helpers/linkify';
import { showInAppBrowser } from '@/helpers/inAppBrowserBridge';

/** Opens http(s) in Udara's in-app browser; mailto/tel/deep links use the system handler. */
export async function openLink(url: string): Promise<void> {
  const normalized = normalizeLinkUrl(url);

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.open(normalized, '_blank', 'noopener,noreferrer');
    }
    return;
  }

  if (isExternalLinkScheme(normalized)) {
    await Linking.openURL(normalized);
    return;
  }

  if (isHttpUrl(normalized)) {
    showInAppBrowser(normalized);
    return;
  }

  const canOpen = await Linking.canOpenURL(normalized);
  if (canOpen) {
    await Linking.openURL(normalized);
    return;
  }

  await Linking.openURL(normalized);
}

export { parseTextWithLinks } from '@/helpers/linkify';
export type { TextPart } from '@/helpers/linkify';
