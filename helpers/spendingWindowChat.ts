import {
  clampWindowEnd,
  clampWindowStart,
  formatWindowRange,
  SPENDING_WINDOW_BOUNDS,
  windowDurationMinutes,
} from '@/helpers/spendingWindow';

const WINDOW_INTENT =
  /(?:spending\s+window|window\s+hours|when\s+i\s+can\s+spend|spending\s+hours)/i;

const RANGE_PATTERN =
  /(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)?)\s*(?:to|–|-|—|through|until)\s*(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)?)/i;

export function buildSpendingWindowChatMessage(startMinutes: number, endMinutes: number): string {
  return `Set my spending window to ${formatWindowRange(startMinutes, endMinutes)}`;
}

export function isSpendingWindowChatMessage(text: string): boolean {
  return WINDOW_INTENT.test(text) || /^set my spending window to/i.test(text.trim());
}

function parseClockToken(raw: string, fallbackPeriod?: 'AM' | 'PM'): number | null {
  const token = raw.trim().toLowerCase().replace(/\./g, '');
  const match = token.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return null;

  let hour = Number(match[1]);
  const mins = match[2] ? Number(match[2]) : 0;
  const period = (match[3]?.toUpperCase() as 'AM' | 'PM' | undefined) ?? fallbackPeriod;

  if (mins < 0 || mins > 59 || hour < 0 || hour > 23) return null;

  if (period) {
    if (hour === 12) hour = period === 'AM' ? 0 : 12;
    else if (period === 'PM') hour += 12;
  } else if (hour <= 12) {
    // Bare hour in spending-window chat defaults to AM for opens, PM for closes when ambiguous.
    if (hour === 12) hour = 0;
  }

  return hour * 60 + mins;
}

export function tryParseSpendingWindowRequest(text: string): { start: number; end: number } | null {
  if (!isSpendingWindowChatMessage(text)) return null;

  const rangeMatch = text.match(RANGE_PATTERN);
  if (!rangeMatch) return null;

  const openToken = rangeMatch[1];
  const closeToken = rangeMatch[2];

  let start = parseClockToken(openToken, 'AM');
  let end = parseClockToken(closeToken, 'PM');

  if (start == null || end == null) return null;

  const rawSpan = end >= start ? end - start : end + 1440 - start;
  if (rawSpan < 60) return null;

  if (end <= start && !/pm/i.test(closeToken) && /am/i.test(openToken)) {
    end = parseClockToken(closeToken, 'PM') ?? end;
  }

  start = clampWindowStart(start, end);
  end = clampWindowEnd(end, start);

  if (start < SPENDING_WINDOW_BOUNDS.earliestStart || end > SPENDING_WINDOW_BOUNDS.latestEnd) {
    return null;
  }

  if (windowDurationMinutes(start, end) < 60) return null;

  return { start, end };
}

export function buildSpendingWindowAppliedReply(startMinutes: number, endMinutes: number): string {
  return `Done — spending is allowed ${formatWindowRange(startMinutes, endMinutes)} each day. You can tweak it anytime in Profile → Discipline.`;
}

export function buildSpendingWindowHelpReply(): string {
  return 'Tell me your window like “9 AM to 7 PM”. Spending is only allowed between those times each day (earliest open 7 AM, latest close 8 PM).';
}
