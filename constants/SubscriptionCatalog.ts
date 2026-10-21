import type { Cadence } from '@/constants/MockInsights';

export type SubCategory =
  | 'TV & Streaming'
  | 'Music'
  | 'Telecom'
  | 'Productivity'
  | 'Cloud & Storage'
  | 'Gaming'
  | 'Education'
  | 'Health & Fitness'
  | 'News & Magazines'
  | 'Food & Delivery'
  | 'Shopping'
  | 'Finance'
  | 'Security & VPN'
  | 'Utilities'
  | 'Social'
  | 'Other';

/** Full category list for pickers — keep in display order. */
export const SUB_CATEGORIES: SubCategory[] = [
  'TV & Streaming',
  'Music',
  'Telecom',
  'Productivity',
  'Cloud & Storage',
  'Gaming',
  'Education',
  'Health & Fitness',
  'News & Magazines',
  'Food & Delivery',
  'Shopping',
  'Finance',
  'Security & VPN',
  'Utilities',
  'Social',
  'Other',
];

export type CatalogSub = {
  id: string;
  /** Filename stem under assets/images/subs/{logoKey}.png when you add logos. */
  logoKey: string;
  name: string;
  company: string;
  category: SubCategory;
  /** Typical Naira price for the common plan — editable on the detail step. */
  defaultAmount: number;
  defaultCadence: Cadence;
  /** Brand color for the letter-mark placeholder until a logo file is registered. */
  color: string;
};

/**
 * Popular recurring services in Nigeria.
 * Drop PNGs into `assets/images/subs/` named `{logoKey}.png`, then register
 * them in `components/insights/subscriptionLogos.ts`.
 */
export const SUBSCRIPTION_CATALOG: CatalogSub[] = [
  // TV & Streaming
  {
    id: 'dstv-compact',
    logoKey: 'dstv',
    name: 'DStv Compact',
    company: 'MultiChoice',
    category: 'TV & Streaming',
    defaultAmount: 24000,
    defaultCadence: 'monthly',
    color: '#0066b3',
  },
  {
    id: 'dstv-premium',
    logoKey: 'dstv',
    name: 'DStv Premium',
    company: 'MultiChoice',
    category: 'TV & Streaming',
    defaultAmount: 44000,
    defaultCadence: 'monthly',
    color: '#0066b3',
  },
  {
    id: 'gotv',
    logoKey: 'gotv',
    name: 'GOtv Max',
    company: 'MultiChoice',
    category: 'TV & Streaming',
    defaultAmount: 7200,
    defaultCadence: 'monthly',
    color: '#e31837',
  },
  {
    id: 'showmax',
    logoKey: 'showmax',
    name: 'Showmax',
    company: 'MultiChoice',
    category: 'TV & Streaming',
    defaultAmount: 3200,
    defaultCadence: 'monthly',
    color: '#ff0066',
  },
  {
    id: 'netflix',
    logoKey: 'netflix',
    name: 'Netflix',
    company: 'Netflix',
    category: 'TV & Streaming',
    defaultAmount: 5500,
    defaultCadence: 'monthly',
    color: '#e50914',
  },
  {
    id: 'prime-video',
    logoKey: 'prime-video',
    name: 'Prime Video',
    company: 'Amazon',
    category: 'TV & Streaming',
    defaultAmount: 2200,
    defaultCadence: 'monthly',
    color: '#00a8e1',
  },
  {
    id: 'youtube-premium',
    logoKey: 'youtube',
    name: 'YouTube Premium',
    company: 'Google',
    category: 'TV & Streaming',
    defaultAmount: 3900,
    defaultCadence: 'monthly',
    color: '#ff0000',
  },
  {
    id: 'disney-plus',
    logoKey: 'disney-plus',
    name: 'Disney+',
    company: 'Disney',
    category: 'TV & Streaming',
    defaultAmount: 3600,
    defaultCadence: 'monthly',
    color: '#113ccf',
  },
  {
    id: 'startimes',
    logoKey: 'startimes',
    name: 'StarTimes',
    company: 'StarTimes',
    category: 'TV & Streaming',
    defaultAmount: 4500,
    defaultCadence: 'monthly',
    color: '#f5a623',
  },

  // Music
  {
    id: 'spotify',
    logoKey: 'spotify',
    name: 'Spotify',
    company: 'Spotify',
    category: 'Music',
    defaultAmount: 1900,
    defaultCadence: 'monthly',
    color: '#1db954',
  },
  {
    id: 'apple-music',
    logoKey: 'apple-music',
    name: 'Apple Music',
    company: 'Apple',
    category: 'Music',
    defaultAmount: 1500,
    defaultCadence: 'monthly',
    color: '#fc3c44',
  },
  {
    id: 'boomplay',
    logoKey: 'boomplay',
    name: 'Boomplay',
    company: 'Transsion',
    category: 'Music',
    defaultAmount: 900,
    defaultCadence: 'monthly',
    color: '#00c853',
  },
  {
    id: 'audiomack',
    logoKey: 'audiomack',
    name: 'Audiomack Premium',
    company: 'Audiomack',
    category: 'Music',
    defaultAmount: 1500,
    defaultCadence: 'monthly',
    color: '#ffa200',
  },

  // Telecom
  {
    id: 'mtn-pulse',
    logoKey: 'mtn',
    name: 'MTN Pulse',
    company: 'MTN',
    category: 'Telecom',
    defaultAmount: 5000,
    defaultCadence: 'monthly',
    color: '#ffcc00',
  },
  {
    id: 'airtel-smart',
    logoKey: 'airtel',
    name: 'Airtel SmartPREME',
    company: 'Airtel',
    category: 'Telecom',
    defaultAmount: 4000,
    defaultCadence: 'monthly',
    color: '#ed1c24',
  },
  {
    id: 'glo-data',
    logoKey: 'glo',
    name: 'Glo Data Plan',
    company: 'Glo',
    category: 'Telecom',
    defaultAmount: 3500,
    defaultCadence: 'monthly',
    color: '#00a651',
  },
  {
    id: '9mobile',
    logoKey: '9mobile',
    name: '9mobile MoreFlex',
    company: '9mobile',
    category: 'Telecom',
    defaultAmount: 3000,
    defaultCadence: 'monthly',
    color: '#006633',
  },

  // Productivity
  {
    id: 'microsoft-365',
    logoKey: 'microsoft-365',
    name: 'Microsoft 365',
    company: 'Microsoft',
    category: 'Productivity',
    defaultAmount: 9500,
    defaultCadence: 'monthly',
    color: '#d83b01',
  },
  {
    id: 'canva-pro',
    logoKey: 'canva',
    name: 'Canva Pro',
    company: 'Canva',
    category: 'Productivity',
    defaultAmount: 7500,
    defaultCadence: 'monthly',
    color: '#00c4cc',
  },
  {
    id: 'chatgpt-plus',
    logoKey: 'chatgpt',
    name: 'ChatGPT Plus',
    company: 'OpenAI',
    category: 'Productivity',
    defaultAmount: 32000,
    defaultCadence: 'monthly',
    color: '#10a37f',
  },
  {
    id: 'notion',
    logoKey: 'notion',
    name: 'Notion Plus',
    company: 'Notion',
    category: 'Productivity',
    defaultAmount: 16000,
    defaultCadence: 'monthly',
    color: '#000000',
  },
  {
    id: 'adobe-cc',
    logoKey: 'adobe',
    name: 'Adobe Creative Cloud',
    company: 'Adobe',
    category: 'Productivity',
    defaultAmount: 28000,
    defaultCadence: 'monthly',
    color: '#eb1000',
  },

  // Cloud & Storage
  {
    id: 'google-one',
    logoKey: 'google-one',
    name: 'Google One',
    company: 'Google',
    category: 'Cloud & Storage',
    defaultAmount: 2900,
    defaultCadence: 'monthly',
    color: '#4285f4',
  },
  {
    id: 'icloud',
    logoKey: 'icloud',
    name: 'iCloud+',
    company: 'Apple',
    category: 'Cloud & Storage',
    defaultAmount: 1500,
    defaultCadence: 'monthly',
    color: '#3693f8',
  },
  {
    id: 'dropbox',
    logoKey: 'dropbox',
    name: 'Dropbox Plus',
    company: 'Dropbox',
    category: 'Cloud & Storage',
    defaultAmount: 18000,
    defaultCadence: 'monthly',
    color: '#0061ff',
  },

  // Gaming
  {
    id: 'playstation-plus',
    logoKey: 'playstation',
    name: 'PlayStation Plus',
    company: 'Sony',
    category: 'Gaming',
    defaultAmount: 12000,
    defaultCadence: 'monthly',
    color: '#003791',
  },
  {
    id: 'xbox-game-pass',
    logoKey: 'xbox',
    name: 'Xbox Game Pass',
    company: 'Microsoft',
    category: 'Gaming',
    defaultAmount: 15000,
    defaultCadence: 'monthly',
    color: '#107c10',
  },
  {
    id: 'nintendo-online',
    logoKey: 'nintendo',
    name: 'Nintendo Switch Online',
    company: 'Nintendo',
    category: 'Gaming',
    defaultAmount: 3500,
    defaultCadence: 'monthly',
    color: '#e60012',
  },

  // Education
  {
    id: 'udemy',
    logoKey: 'udemy',
    name: 'Udemy Personal Plan',
    company: 'Udemy',
    category: 'Education',
    defaultAmount: 12500,
    defaultCadence: 'monthly',
    color: '#a435f0',
  },
  {
    id: 'coursera',
    logoKey: 'coursera',
    name: 'Coursera Plus',
    company: 'Coursera',
    category: 'Education',
    defaultAmount: 28000,
    defaultCadence: 'monthly',
    color: '#0056d2',
  },
  {
    id: 'skillshare',
    logoKey: 'skillshare',
    name: 'Skillshare',
    company: 'Skillshare',
    category: 'Education',
    defaultAmount: 16000,
    defaultCadence: 'monthly',
    color: '#00ff84',
  },

  // Health & Fitness
  {
    id: 'fitbit-premium',
    logoKey: 'fitbit',
    name: 'Fitbit Premium',
    company: 'Google',
    category: 'Health & Fitness',
    defaultAmount: 5500,
    defaultCadence: 'monthly',
    color: '#00b0b9',
  },
  {
    id: 'strava',
    logoKey: 'strava',
    name: 'Strava Subscription',
    company: 'Strava',
    category: 'Health & Fitness',
    defaultAmount: 7500,
    defaultCadence: 'monthly',
    color: '#fc4c02',
  },

  // News & Magazines
  {
    id: 'nyt',
    logoKey: 'nyt',
    name: 'New York Times',
    company: 'NYT',
    category: 'News & Magazines',
    defaultAmount: 6500,
    defaultCadence: 'monthly',
    color: '#000000',
  },
  {
    id: 'premium-times',
    logoKey: 'premium-times',
    name: 'Premium Times',
    company: 'Premium Times',
    category: 'News & Magazines',
    defaultAmount: 2000,
    defaultCadence: 'monthly',
    color: '#c8102e',
  },
  {
    id: 'punch',
    logoKey: 'punch',
    name: 'Punch Newspapers',
    company: 'Punch',
    category: 'News & Magazines',
    defaultAmount: 1500,
    defaultCadence: 'monthly',
    color: '#ed1c24',
  },

  // Food & Delivery
  {
    id: 'chowdeck',
    logoKey: 'chowdeck',
    name: 'Chowdeck Plus',
    company: 'Chowdeck',
    category: 'Food & Delivery',
    defaultAmount: 2500,
    defaultCadence: 'monthly',
    color: '#ff5a00',
  },
  {
    id: 'glovo-prime',
    logoKey: 'glovo',
    name: 'Glovo Prime',
    company: 'Glovo',
    category: 'Food & Delivery',
    defaultAmount: 3000,
    defaultCadence: 'monthly',
    color: '#ffc244',
  },

  // Shopping
  {
    id: 'amazon-prime',
    logoKey: 'amazon',
    name: 'Amazon Prime',
    company: 'Amazon',
    category: 'Shopping',
    defaultAmount: 4500,
    defaultCadence: 'monthly',
    color: '#ff9900',
  },
  {
    id: 'jumia-prime',
    logoKey: 'jumia',
    name: 'Jumia Prime',
    company: 'Jumia',
    category: 'Shopping',
    defaultAmount: 2000,
    defaultCadence: 'monthly',
    color: '#f68b1e',
  },

  // Finance
  {
    id: 'piggyvest-plus',
    logoKey: 'piggyvest',
    name: 'PiggyVest Plus',
    company: 'PiggyVest',
    category: 'Finance',
    defaultAmount: 1000,
    defaultCadence: 'monthly',
    color: '#0dcc71',
  },
  {
    id: 'cowrywise',
    logoKey: 'cowrywise',
    name: 'Cowrywise Premium',
    company: 'Cowrywise',
    category: 'Finance',
    defaultAmount: 1500,
    defaultCadence: 'monthly',
    color: '#0066f5',
  },

  // Security & VPN
  {
    id: 'nordvpn',
    logoKey: 'nordvpn',
    name: 'NordVPN',
    company: 'Nord Security',
    category: 'Security & VPN',
    defaultAmount: 6500,
    defaultCadence: 'monthly',
    color: '#4687ff',
  },
  {
    id: '1password',
    logoKey: '1password',
    name: '1Password',
    company: '1Password',
    category: 'Security & VPN',
    defaultAmount: 8500,
    defaultCadence: 'monthly',
    color: '#0572ec',
  },

  // Utilities
  {
    id: 'starlink',
    logoKey: 'starlink',
    name: 'Starlink',
    company: 'SpaceX',
    category: 'Utilities',
    defaultAmount: 65000,
    defaultCadence: 'monthly',
    color: '#000000',
  },
  {
    id: 'spectranet',
    logoKey: 'spectranet',
    name: 'Spectranet',
    company: 'Spectranet',
    category: 'Utilities',
    defaultAmount: 15000,
    defaultCadence: 'monthly',
    color: '#e31c23',
  },

  // Social
  {
    id: 'linkedin-premium',
    logoKey: 'linkedin',
    name: 'LinkedIn Premium',
    company: 'LinkedIn',
    category: 'Social',
    defaultAmount: 28000,
    defaultCadence: 'monthly',
    color: '#0a66c2',
  },
  {
    id: 'x-premium',
    logoKey: 'x',
    name: 'X Premium',
    company: 'X',
    category: 'Social',
    defaultAmount: 12000,
    defaultCadence: 'monthly',
    color: '#000000',
  },
];

export const CUSTOM_SUB: CatalogSub = {
  id: 'custom',
  logoKey: 'custom',
  name: '',
  company: 'Custom',
  category: 'Other',
  defaultAmount: 0,
  defaultCadence: 'monthly',
  color: '#4a0508',
};

export function groupCatalogByCategory(items: CatalogSub[]) {
  const order = SUB_CATEGORIES;
  const map = new Map<SubCategory, CatalogSub[]>();
  for (const item of items) {
    const list = map.get(item.category) ?? [];
    list.push(item);
    map.set(item.category, list);
  }
  return order
    .filter((c) => (map.get(c)?.length ?? 0) > 0)
    .map((category) => ({ category, items: map.get(category)! }));
}

export function filterCatalog(query: string): CatalogSub[] {
  const q = query.trim().toLowerCase();
  if (!q) return SUBSCRIPTION_CATALOG;
  return SUBSCRIPTION_CATALOG.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.company.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q),
  );
}

export function cadenceLabel(cadence: Cadence): string {
  if (cadence === 'weekly') return 'Every week';
  if (cadence === 'yearly') return 'Every year';
  return 'Every month';
}

export function formatLongDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
