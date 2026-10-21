import {
  MockRecentSaves,
  MockSavingsBuckets,
  type RecentSave,
  type SavingsActivity,
  type SavingsBucket,
  type SavingsBucketId,
} from '@/constants/MockData';
import {
  resolveSavingsStatus,
  type MoneyMovementDirection,
  type MoneyMovementStatus,
} from '@/constants/TransactionStatus';

export type SavingsMovementRecord = {
  id: string;
  label: string;
  amount: number;
  when: string;
  /** ISO timestamp for sorting and period grouping. */
  occurredAt?: string;
  status?: MoneyMovementStatus;
  direction?: MoneyMovementDirection;
  bucketId: SavingsBucketId;
  category: string;
};

export type SavingsActivityDetail = SavingsMovementRecord & {
  status: MoneyMovementStatus;
  direction: MoneyMovementDirection;
  bucketTitle: string;
  bucketColor: string;
  bucketSubtitle: string;
  method: string;
  typeLabel: string;
  sourceAccount: string;
  destination: string;
  reference: string;
  sessionId: string;
  dateLabel: string;
};

let liveRecent: RecentSave[] = MockRecentSaves;
let liveBuckets: SavingsBucket[] = MockSavingsBuckets;
const bucketItemOverrides: Partial<Record<SavingsBucketId, SavingsActivity[]>> = {};

export function setLiveRecentSaves(saves: RecentSave[]) {
  liveRecent = saves;
}

export function setLiveSavingsBuckets(buckets: SavingsBucket[]) {
  liveBuckets = buckets;
}

export function patchBucketItems(bucketId: SavingsBucketId, items: SavingsActivity[]) {
  bucketItemOverrides[bucketId] = items;
}

function seedFromId(id: string): number {
  let n = 0;
  for (let i = 0; i < id.length; i += 1) n += id.charCodeAt(i) * (i + 1);
  return n;
}

function inferBucketFromLabel(label: string): SavingsBucketId {
  const lower = label.toLowerCase();
  if (lower.includes('auto save')) return 'auto-save';
  if (lower.includes('hardlock') || lower.includes('safelock')) return 'hardlock';
  if (
    lower.includes('goal') ||
    lower.includes('rent buffer') ||
    lower.includes('emergency') ||
    lower.includes('withdrawal · rent')
  ) {
    return 'goal-based';
  }
  if (lower.includes('spend & save') || lower.includes('spend and save')) return 'spend-save';
  return 'spend-save';
}

export function parseSavingsCategory(label: string): string {
  const parts = label.split('·').map((s) => s.trim());
  if (parts.length >= 2) return parts[parts.length - 1];
  if (/round-up/i.test(label)) return 'Round-up';
  if (/weekly/i.test(label)) return 'Weekly schedule';
  if (/payday/i.test(label)) return 'Payday save';
  if (/top-up/i.test(label)) return 'Manual top-up';
  if (/withdrawal/i.test(label)) return 'Withdrawal';
  if (/transfer/i.test(label)) return 'Transfer out';
  if (/lock/i.test(label)) return 'HardLock';
  if (/from /i.test(label)) return 'Quick Save';
  if (/match/i.test(label)) return 'Spend match';
  return 'Savings';
}

function bucketsForLookup(): SavingsBucket[] {
  return liveBuckets.map((b) => ({
    ...b,
    items: bucketItemOverrides[b.id] ?? b.items,
  }));
}

function allRecords(): SavingsMovementRecord[] {
  const map = new Map<string, SavingsMovementRecord>();

  for (const bucket of bucketsForLookup()) {
    for (const item of bucket.items) {
      map.set(item.id, {
        id: item.id,
        label: item.label,
        amount: item.amount,
        when: item.meta,
        occurredAt: item.occurredAt,
        status: item.status,
        direction: item.direction,
        bucketId: bucket.id,
        category: parseSavingsCategory(item.label),
      });
    }
  }

  for (const save of liveRecent) {
    map.set(save.id, {
      id: save.id,
      label: save.label,
      amount: save.amount,
      when: save.when,
      occurredAt: save.occurredAt,
      status: save.status,
      direction: save.direction,
      bucketId: save.bucketId ?? inferBucketFromLabel(save.label),
      category: parseSavingsCategory(save.label),
    });
  }

  return Array.from(map.values());
}

const SCHEDULE_ONLY_META = /^(Every |Monthly|Active)$/i;

/** Savings history for a single bucket — newest first. */
export function listActivitiesForBucket(bucketId: SavingsBucketId): SavingsMovementRecord[] {
  return listAllSavingsActivities()
    .filter((record) => {
      if (record.bucketId !== bucketId) return false;
      if (
        SCHEDULE_ONLY_META.test(record.when) &&
        /weekly|payday|match/i.test(record.label.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const ta = a.occurredAt ? new Date(a.occurredAt).getTime() : 0;
      const tb = b.occurredAt ? new Date(b.occurredAt).getTime() : 0;
      if (tb !== ta) return tb - ta;
      const ai = liveRecent.findIndex((s) => s.id === a.id);
      const bi = liveRecent.findIndex((s) => s.id === b.id);
      if (ai >= 0 && bi >= 0) return ai - bi;
      if (ai >= 0) return -1;
      if (bi >= 0) return 1;
      return 0;
    });
}

export function getSavingsActivityById(id: string): SavingsMovementRecord | undefined {
  return allRecords().find((r) => r.id === id);
}

/** Full savings history — recent saves first, then bucket activity. */
export function listAllSavingsActivities(): SavingsMovementRecord[] {
  const records = allRecords();
  const recentOrder = new Map(liveRecent.map((s, i) => [s.id, i]));
  return [...records].sort((a, b) => {
    const ai = recentOrder.get(a.id);
    const bi = recentOrder.get(b.id);
    if (ai != null && bi != null) return ai - bi;
    if (ai != null) return -1;
    if (bi != null) return 1;
    return a.label.localeCompare(b.label);
  });
}

function savingsTypeLabel(record: SavingsMovementRecord): string {
  const dir = record.direction ?? 'in';
  if (dir === 'out') {
    if (/withdrawal|unlock/i.test(record.label)) return 'Withdrawal';
    return 'Transfer out';
  }
  if (/round-up/i.test(record.label)) return 'Round-up save';
  if (/auto|weekly|payday|scheduled/i.test(record.label)) return 'Auto save';
  if (/lock/i.test(record.label)) return 'HardLock deposit';
  if (/from /i.test(record.label)) return 'Quick Save';
  return 'Manual save';
}

function savingsMethod(record: SavingsMovementRecord, bucketId: SavingsBucketId): string {
  if (/round-up/i.test(record.label)) return 'Round-up on incoming payments';
  if (/match/i.test(record.label)) return 'Percentage of card spend';
  if (/weekly/i.test(record.label)) return 'Scheduled weekly transfer';
  if (/payday/i.test(record.label)) return 'Payday percentage rule';
  if (/lock/i.test(record.label)) return 'Fixed-term lock';
  if (bucketId === 'goal-based') return 'Pot contribution';
  if (/from /i.test(record.label)) return 'One-tap Quick Save';
  if (record.direction === 'out') return 'Transfer to main account';
  return 'Manual transfer';
}

const MOCK_ACCOUNTS = ['Good Money · Main', 'Good Money · Bills', 'Good Money · Flex'];

function dateLabelFor(when: string, seed: number): string {
  if (when === 'Just now') return 'Just now';
  if (when === 'Today') return `Today · ${8 + (seed % 10)}:${String((seed * 7) % 60).padStart(2, '0')}am`;
  if (when === 'Yesterday') return 'Yesterday · 2:14pm';
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const idx = days.indexOf(when);
  if (idx >= 0) return `${when} · ${10 + (seed % 8)}:${String((seed * 3) % 60).padStart(2, '0')}am`;
  return when;
}

export function buildSavingsActivityDetail(record: SavingsMovementRecord): SavingsActivityDetail {
  const bucket =
    bucketsForLookup().find((b) => b.id === record.bucketId) ??
    MockSavingsBuckets.find((b) => b.id === record.bucketId)!;
  const seed = seedFromId(record.id);
  const status = resolveSavingsStatus(record);
  const direction = record.direction ?? 'in';
  const refSuffix = record.id.replace(/\D/g, '').slice(-8).padStart(8, '0');
  const sessionSuffix = String(505150102405576300 + seed * 773).slice(0, 18);
  const sourceAccount = MOCK_ACCOUNTS[seed % MOCK_ACCOUNTS.length];
  const destination =
    direction === 'out' ? 'Good Money · Main' : `${bucket.title} bucket`;

  return {
    ...record,
    status,
    direction,
    bucketTitle: bucket.title,
    bucketColor: bucket.color,
    bucketSubtitle: bucket.subtitle,
    method: savingsMethod(record, record.bucketId),
    typeLabel: savingsTypeLabel(record),
    sourceAccount: direction === 'out' ? `${bucket.title} bucket` : sourceAccount,
    destination,
    reference: `sav_${refSuffix}${record.id.slice(-4)}Ud`,
    sessionId: sessionSuffix,
    dateLabel: dateLabelFor(record.when, seed),
  };
}
