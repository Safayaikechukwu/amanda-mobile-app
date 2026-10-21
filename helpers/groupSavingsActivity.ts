import type { SavingsMovementRecord } from '@/constants/SavingsActivity';
import { movementSubtitle, type MoneyMovementStatus } from '@/constants/TransactionStatus';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export type SavingsActivityPeriodGroup = {
  key: string;
  label: string;
  sortOrder: number;
  items: SavingsMovementRecord[];
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
}

function daysAgo(days: number, ref: Date): Date {
  const d = startOfDay(ref);
  d.setDate(d.getDate() - days);
  return d;
}

function seedFromId(id: string): number {
  let n = 0;
  for (let i = 0; i < id.length; i += 1) n += id.charCodeAt(i) * (i + 1);
  return n;
}

/** Parse relative `when` strings into a sortable date. */
export function resolveActivityDate(record: SavingsMovementRecord, ref = new Date()): Date {
  if (record.occurredAt) return startOfDay(new Date(record.occurredAt));

  const raw = record.when.split('·')[0]?.trim() ?? record.when;

  if (raw === 'Just now' || raw === 'Today') return startOfDay(ref);
  if (raw === 'Yesterday') return daysAgo(1, ref);

  const weekdayIdx = WEEKDAYS.indexOf(raw as (typeof WEEKDAYS)[number]);
  if (weekdayIdx >= 0) {
    const todayIdx = ref.getDay();
    let daysBack = (todayIdx - weekdayIdx + 7) % 7;
    if (daysBack === 0) daysBack = 7;
    return daysAgo(daysBack, ref);
  }

  if (/this month/i.test(record.when)) return daysAgo(4, ref);
  if (/processing|active|every|monthly/i.test(record.when)) return daysAgo(12, ref);
  if (/declined/i.test(record.when)) return daysAgo(9, ref);

  const unlockMatch = record.when.match(/Unlocks\s+(\w+)\s+(\d{4})/i);
  if (unlockMatch) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mi = monthNames.findIndex(
      (m) => m.toLowerCase() === unlockMatch[1].slice(0, 3).toLowerCase(),
    );
    if (mi >= 0) {
      const unlock = new Date(parseInt(unlockMatch[2], 10), mi, 15);
      unlock.setMonth(unlock.getMonth() - 3);
      return startOfDay(unlock);
    }
  }

  if (/of ₦|of \$/i.test(record.when)) return daysAgo(38, ref);

  return daysAgo(21, ref);
}

function periodForDate(date: Date, ref: Date): Pick<SavingsActivityPeriodGroup, 'key' | 'label' | 'sortOrder'> {
  const today = startOfDay(ref);
  const target = startOfDay(date);
  const diffMs = today.getTime() - target.getTime();
  const diffDays = Math.round(diffMs / 86_400_000);

  if (diffDays <= 0) {
    return { key: 'today', label: 'Today', sortOrder: 0 };
  }
  if (diffDays === 1) {
    return { key: 'yesterday', label: 'Yesterday', sortOrder: 1 };
  }
  if (diffDays >= 2 && diffDays <= 6) {
    const label = target.toLocaleDateString('en-US', { weekday: 'long' });
    return {
      key: `weekday-${target.toISOString().slice(0, 10)}`,
      label,
      sortOrder: 2 + diffDays / 100,
    };
  }
  if (diffDays >= 7 && diffDays <= 13) {
    return { key: 'last-week', label: 'Last week', sortOrder: 10 };
  }

  const sameMonth =
    target.getMonth() === ref.getMonth() && target.getFullYear() === ref.getFullYear();
  if (sameMonth) {
    return { key: 'earlier-month', label: 'Earlier this month', sortOrder: 20 };
  }

  const label = target.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const monthOffset =
    (ref.getFullYear() - target.getFullYear()) * 12 + (ref.getMonth() - target.getMonth());
  return {
    key: `month-${target.getFullYear()}-${target.getMonth()}`,
    label,
    sortOrder: 30 + monthOffset,
  };
}

function timeLabelFor(record: SavingsMovementRecord): string {
  const seed = seedFromId(record.id);
  const hour = 7 + (seed % 12);
  const minute = (seed * 7) % 60;
  const suffix = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${String(minute).padStart(2, '0')}${suffix}`;
}

/** Subtitle for grouped list rows — time + status, without repeating the section day. */
export function activityRowSubtitle(
  record: SavingsMovementRecord,
  status: MoneyMovementStatus,
): string {
  const raw = record.when.trim();
  if (/unlocks|declined|active|every|monthly|processing|this month|of ₦|of \$/i.test(raw)) {
    return movementSubtitle([raw], status);
  }
  return movementSubtitle([timeLabelFor(record)], status);
}

export function groupSavingsActivitiesByPeriod(
  records: SavingsMovementRecord[],
  ref = new Date(),
): SavingsActivityPeriodGroup[] {
  const groups = new Map<string, SavingsActivityPeriodGroup>();

  for (const record of records) {
    const date = resolveActivityDate(record, ref);
    const period = periodForDate(date, ref);
    const existing = groups.get(period.key);
    if (existing) {
      existing.items.push(record);
      continue;
    }
    groups.set(period.key, {
      ...period,
      items: [record],
    });
  }

  return [...groups.values()]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((group) => ({
      ...group,
      items: [...group.items].sort(
        (a, b) => resolveActivityDate(b, ref).getTime() - resolveActivityDate(a, ref).getTime(),
      ),
    }));
}
