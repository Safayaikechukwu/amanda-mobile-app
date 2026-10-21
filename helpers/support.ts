import * as Linking from 'expo-linking';

import { Theme } from '@/constants/Theme';
import { openLink } from '@/helpers/openLink';

/** Udara support contacts */
export const SUPPORT_EMAIL = 'safaya@useudara.com';
export const SUPPORT_WHATSAPP_DISPLAY = '07077069738';
/** E.164 without + — 07077069738 → 2347077069738 */
const WHATSAPP_PHONE = '2347077069738';

/** Udara community — WhatsApp group invite. */
const UDARA_COMMUNITY_URL = 'https://chat.whatsapp.com/ElaYQLfZk2AKOqAJGKdiiN?mode=gi_t';

export async function openUdaraCommunity(): Promise<void> {
  await openLink(UDARA_COMMUNITY_URL);
}

export async function openWhatsAppSupport(name?: string | null): Promise<void> {
  const greeting = name?.trim() ? `Hi Udara, I need help — ${name.trim()}.` : 'Hi Udara, I need help.';
  const text = encodeURIComponent(greeting);
  const nativeUrl = `whatsapp://send?phone=${WHATSAPP_PHONE}&text=${text}`;
  const webUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${text}`;

  try {
    const canUseApp = await Linking.canOpenURL(nativeUrl);
    await Linking.openURL(canUseApp ? nativeUrl : webUrl);
  } catch {
    await Linking.openURL(webUrl);
  }
}

export async function openPrivacyPolicy(): Promise<void> {
  await openLink(Theme.link.privacy);
}

export async function openTermsOfUse(): Promise<void> {
  await openLink(Theme.link.terms);
}
