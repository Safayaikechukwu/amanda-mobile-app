/** Beneficiary catalog — queryable like a backend list (search + paging). */

import type { ManagedPerson } from '@/constants/MoneyControls';

export type BeneficiaryFilter = 'payees' | 'blocked' | 'limits' | 'recurring' | 'all';

export type BeneficiaryStats = {
  payees: number;
  blocked: number;
  limits: number;
  recurring: number;
  total: number;
};

export type BeneficiaryQueryResult = {
  items: ManagedPerson[];
  total: number;
  hasMore: boolean;
};

const BANKS = [
  'GTBank',
  'Access Bank',
  'Zenith',
  'UBA',
  'First Bank',
  'Kuda',
  'Opay',
  'Palmpay',
  'Stanbic',
  'Fidelity',
] as const;

const FIRST = [
  'Amaka',
  'Tunde',
  'Chioma',
  'Emeka',
  'Fatima',
  'Ibrahim',
  'Ngozi',
  'Yusuf',
  'Blessing',
  'Kemi',
  'Chidi',
  'Amina',
  'Olu',
  'Zainab',
  'Ifeanyi',
  'Halima',
  'Segun',
  'Adaeze',
  'Musa',
  'Funke',
] as const;

const LAST = ['O.', 'K.', 'N.', 'A.', 'B.', 'E.', 'M.', 'S.', 'T.', 'U.'] as const;

const PAGE_DEFAULT = 30;

/** Deterministic pseudo-random for stable mock data. */
function seedRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/** ~7 years of saved payees — replace with API pagination in production. */
function buildCatalog(): ManagedPerson[] {
  const rand = seedRand(42);
  const people: ManagedPerson[] = [];

  // Anchors users recognise from earlier mocks
  people.push(
    {
      id: 'p-landlord',
      name: 'Landlord',
      bank: 'First Bank',
      last4: '1180',
      recurringAmount: 450_000,
      recurringCadence: 'monthly',
      recurringNext: '1 Sep',
      sendCount: 84,
      totalSent: 37_800_000,
    },
    {
      id: 'p-mama',
      name: 'Mama',
      bank: 'Opay',
      last4: '5562',
      limit: 20_000,
      sendCount: 156,
      totalSent: 2_340_000,
    },
    {
      id: 'p-amaka',
      name: 'Amaka O.',
      bank: 'Access Bank',
      last4: '2208',
      sendCount: 94,
      totalSent: 6_580_000,
    },
  );

  for (let i = 0; i < 148; i++) {
    const id = `p-${i + 100}`;
    const first = FIRST[Math.floor(rand() * FIRST.length)];
    const last = LAST[Math.floor(rand() * LAST.length)];
    const bank = BANKS[Math.floor(rand() * BANKS.length)];
    const last4 = String(Math.floor(rand() * 10000)).padStart(4, '0');
    const ageDays = Math.floor(rand() * 2555); // ~7 years
    const sendCount = Math.floor(rand() * 120);
    const totalSent = sendCount > 0 ? Math.floor(rand() * 4_000_000) + 5_000 : 0;

    const person: ManagedPerson = {
      id,
      name: `${first} ${last}`,
      bank,
      last4,
      sendCount: sendCount || undefined,
      totalSent: totalSent || undefined,
    };

    // ~10% blocked historically
    if (rand() < 0.1) {
      person.blocked = true;
      person.blockedAt = isoDaysAgo(ageDays);
      delete person.sendCount;
      delete person.totalSent;
    } else {
      // ~18% with caps
      if (rand() < 0.18) {
        person.limit = [10_000, 20_000, 50_000, 75_000, 100_000, 250_000][Math.floor(rand() * 6)];
      }
      // ~12% recurring
      if (rand() < 0.12) {
        person.recurringAmount = [5_000, 15_000, 25_000, 50_000, 120_000, 450_000][
          Math.floor(rand() * 6)
        ];
        person.recurringCadence = rand() < 0.85 ? 'monthly' : 'weekly';
        person.recurringNext = `${Math.floor(rand() * 28) + 1} Sep`;
      }
    }

    people.push(person);
  }

  // Known blocked entry
  people.push({
    id: 'p-blocked-unknown',
    name: 'Unknown sender',
    bank: 'Kuda',
    last4: '4419',
    blocked: true,
    blockedAt: '2026-07-14',
  });

  return people;
}

let catalogCache: ManagedPerson[] | null = null;

export function getBeneficiaryCatalog(): ManagedPerson[] {
  if (!catalogCache) catalogCache = buildCatalog();
  return catalogCache;
}

function matchesQuery(person: ManagedPerson, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    person.name.toLowerCase().includes(q) ||
    person.bank.toLowerCase().includes(q) ||
    person.last4.includes(q)
  );
}

function filterPeople(filter: BeneficiaryFilter, people: ManagedPerson[]): ManagedPerson[] {
  switch (filter) {
    case 'blocked':
      return people.filter((p) => p.blocked);
    case 'limits':
      return people.filter((p) => !p.blocked && p.limit != null);
    case 'recurring':
      return people.filter((p) => !p.blocked && p.recurringAmount != null);
    case 'payees':
      return people.filter((p) => !p.blocked && (p.sendCount ?? 0) > 0);
    case 'all':
    default:
      return people.filter((p) => !p.blocked);
  }
}

function sortPeople(filter: BeneficiaryFilter, people: ManagedPerson[]): ManagedPerson[] {
  const copy = [...people];
  switch (filter) {
    case 'blocked':
      return copy.sort(
        (a, b) =>
          new Date(b.blockedAt ?? 0).getTime() - new Date(a.blockedAt ?? 0).getTime(),
      );
    case 'limits':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'recurring':
      return copy.sort((a, b) => (b.recurringAmount ?? 0) - (a.recurringAmount ?? 0));
    case 'payees':
      return copy.sort((a, b) => (b.totalSent ?? 0) - (a.totalSent ?? 0));
    case 'all':
    default:
      return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export function getBeneficiaryStats(): BeneficiaryStats {
  const all = getBeneficiaryCatalog();
  return {
    payees: filterPeople('payees', all).length,
    blocked: filterPeople('blocked', all).length,
    limits: filterPeople('limits', all).length,
    recurring: filterPeople('recurring', all).length,
    total: filterPeople('all', all).length,
  };
}

export function queryBeneficiaries(options: {
  filter: BeneficiaryFilter;
  query?: string;
  offset?: number;
  limit?: number;
}): BeneficiaryQueryResult {
  const { filter, query = '', offset = 0, limit = PAGE_DEFAULT } = options;
  const filtered = filterPeople(filter, getBeneficiaryCatalog()).filter((p) =>
    matchesQuery(p, query),
  );
  const sorted = sortPeople(filter, filtered);
  const items = sorted.slice(offset, offset + limit);
  return {
    items,
    total: sorted.length,
    hasMore: offset + limit < sorted.length,
  };
}
