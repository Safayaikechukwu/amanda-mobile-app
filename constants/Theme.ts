/**
 * Udara design tokens — synced with useudara.com (globals.css + layout.tsx)
 * @see ../udara/app/globals.css
 */
export const Theme = {
  color: {
    bg: '#ffffff',
    bgSoft: '#ffffff',
    ink: '#0d0d0d',
    muted: '#6b6b6b',
    cta: '#4a0508',
    ctaHover: '#6b0a12',
    cardBlue: '#f6eaea',
    cardCoral: '#fdecec',
    cardGold: '#fbf3db',
    cardGray: '#f1f1ef',
    highlight: '#f7d070',
    white: '#ffffff',
    // Dark surfaces (onboarding / app shell)
    darkInk: '#0b0b0c',
    darkFade: '#120405',
    oxbloodSoft: '#6b1216',
    whiteMuted: 'rgba(255,255,255,0.55)',
    whiteFaint: 'rgba(255,255,255,0.35)',
    surfaceDark: 'rgba(255,255,255,0.12)',
    surfaceDarkBorder: 'rgba(255,255,255,0.18)',
    // WhatsApp palette (chat UI)
    waGreen: '#d9fdd3',
    waGreenBright: '#25d366',
    waGreenDeep: '#005c4b',
    waBubbleUser: '#d9fdd3',
    waBubbleUdara: '#202c33',
    waHeader: '#1f2c34',
    waBg: '#111b21',
  },
  radius: {
    card: 10,
    button: 6,
    pill: 999,
    logo: 0.3, // 30% — matches site Logo mark
  },
  font: {
    sans: 'Inter',
    serif: 'SourceSerif4',
  },
  type: {
    logo: { fontSize: 21, fontWeight: '600' as const, letterSpacing: -0.42 },
    title: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.6 },
    subtitle: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
    body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
    label: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.3 },
    button: { fontSize: 15, fontWeight: '500' as const },
    socialButton: { fontSize: 16, fontWeight: '600' as const, letterSpacing: -0.2 },
    caption: { fontSize: 13, fontWeight: '400' as const },
    authLogin: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
    balance: { fontSize: 40, fontWeight: '700' as const, letterSpacing: -1 },
  },
  spacing: {
    screenX: 24,
    buttonHeight: 44,
    socialButtonHeight: 52,
    inputHeight: 54,
    /** Auth screen — layout parity (Perplexity structure, Udara tokens) */
    auth: {
      horizontal: 32,
      buttonGap: 12,
      buttonsToLogin: 20,
      bottomMin: 16,
      brandLift: 48, // optical center: logo sits slightly above true mid
    },
  },
  link: {
    privacy: 'https://www.useudara.com/privacy',
    terms: 'https://www.useudara.com/terms',
    site: 'https://www.useudara.com',
  },
} as const;

/** @deprecated use Theme.color */
export const Brand = {
  oxblood: Theme.color.cta,
  oxbloodSoft: Theme.color.oxbloodSoft,
  ink: Theme.color.ink,
  darkFade: Theme.color.darkFade,
  white: Theme.color.white,
  whiteMuted: Theme.color.whiteMuted,
  muted: Theme.color.whiteFaint,
  buttonDark: Theme.color.surfaceDark,
  buttonDarkBorder: Theme.color.surfaceDarkBorder,
  green: Theme.color.waGreenBright,
  greenDark: Theme.color.waGreenDeep,
  site: Theme.link.site,
  privacyUrl: Theme.link.privacy,
  termsUrl: Theme.link.terms,
} as const;
