/** Time math for the spending-window ring (24h on a full clock circle). */

export const SPENDING_WINDOW_CHANGE_LIMITS = {
  perMonth: 3,
  perWeek: 1,
  fineNgn: 5_000,
} as const;

/** Hard product bounds — window handles cannot go outside this range. */
export const SPENDING_WINDOW_BOUNDS = {
  earliestStart: 7 * 60,
  latestEnd: 20 * 60,
} as const;

const SNAP_MINUTES = 15;
const MIN_WINDOW_MINUTES = 60;

export function snapWindowMinutes(minutes: number): number {
  const snapped = Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
  return ((snapped % 1440) + 1440) % 1440;
}

export function formatWindowTime(minutes: number): string {
  const total = ((minutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(total / 60);
  const mins = total % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  if (mins === 0) return `${hour12} ${period}`;
  return `${hour12}:${String(mins).padStart(2, '0')} ${period}`;
}

/** Header style — always includes minutes, e.g. 7:00 AM */
export function formatWindowTimeHeader(minutes: number): string {
  const total = ((minutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(total / 60);
  const mins = total % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(mins).padStart(2, '0')} ${period}`;
}

export function formatWindowRange(startMinutes: number, endMinutes: number): string {
  return `${formatWindowTime(startMinutes)} – ${formatWindowTime(endMinutes)}`;
}

export function windowDurationMinutes(startMinutes: number, endMinutes: number): number {
  let span = endMinutes - startMinutes;
  if (span <= 0) span += 1440;
  return span;
}

/** Apple-style duration label — e.g. "8 hr", "13 hr", "45 min". */
export function formatWindowDurationShort(startMinutes: number, endMinutes: number): string {
  const span = windowDurationMinutes(startMinutes, endMinutes);
  const hours = Math.floor(span / 60);
  const mins = span % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

export function formatWindowDuration(startMinutes: number, endMinutes: number): string {
  return formatWindowDurationShort(startMinutes, endMinutes);
}

export function arcMidpointMinutes(startMinutes: number, endMinutes: number): number {
  const span = windowDurationMinutes(startMinutes, endMinutes);
  return snapWindowMinutes(startMinutes + span / 2);
}

export function isMinuteInWindow(minute: number, startMinutes: number, endMinutes: number): boolean {
  const m = ((minute % 1440) + 1440) % 1440;
  if (endMinutes >= startMinutes) return m >= startMinutes && m <= endMinutes;
  return m >= startMinutes || m <= endMinutes;
}

/** Shift both handles together while keeping duration; clamped to product bounds. */
export function shiftWindowBlock(
  startMinutes: number,
  endMinutes: number,
  deltaMinutes: number,
): { start: number; end: number } {
  const duration = windowDurationMinutes(startMinutes, endMinutes);
  let start = snapWindowMinutes(startMinutes + deltaMinutes);
  let end = snapWindowMinutes(endMinutes + deltaMinutes);

  if (start < SPENDING_WINDOW_BOUNDS.earliestStart) {
    const fix = SPENDING_WINDOW_BOUNDS.earliestStart - start;
    start += fix;
    end += fix;
  }
  if (end > SPENDING_WINDOW_BOUNDS.latestEnd) {
    const fix = end - SPENDING_WINDOW_BOUNDS.latestEnd;
    start -= fix;
    end -= fix;
  }

  start = clampWindowStart(start, end);
  end = clampWindowEnd(end, start);

  if (windowDurationMinutes(start, end) !== duration) {
    return { start: startMinutes, end: endMinutes };
  }

  return { start, end };
}

/** 0:00 at top, clockwise — matches a clock dial. */
export function minutesToClockDegrees(minutes: number): number {
  return (minutes / 1440) * 360 - 90;
}

export function clockDegreesToMinutes(degrees: number): number {
  let fromTop = degrees + 90;
  while (fromTop < 0) fromTop += 360;
  while (fromTop >= 360) fromTop -= 360;
  return snapWindowMinutes((fromTop / 360) * 1440);
}

export function polarPoint(cx: number, cy: number, radius: number, degrees: number) {
  const rad = (degrees * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

export function angleFromCenter(cx: number, cy: number, x: number, y: number): number {
  const deg = (Math.atan2(y - cy, x - cx) * 180) / Math.PI;
  return deg < 0 ? deg + 360 : deg;
}

export function changesRemaining(used: number, limit: number): number {
  return Math.max(0, limit - used);
}

export function changeWillIncurFine(monthRemaining: number, weekRemaining: number): boolean {
  return monthRemaining <= 0 || weekRemaining <= 0;
}

export function clampWindowStart(startMinutes: number, endMinutes: number): number {
  const snapped = snapWindowMinutes(startMinutes);
  const min = SPENDING_WINDOW_BOUNDS.earliestStart;
  const max = Math.max(min, endMinutes - MIN_WINDOW_MINUTES);
  return Math.min(max, Math.max(min, snapped));
}

export function clampWindowEnd(endMinutes: number, startMinutes: number): number {
  const snapped = snapWindowMinutes(endMinutes);
  const min = Math.min(SPENDING_WINDOW_BOUNDS.latestEnd, startMinutes + MIN_WINDOW_MINUTES);
  const max = SPENDING_WINDOW_BOUNDS.latestEnd;
  return Math.min(max, Math.max(min, snapped));
}

export function clampWindowHandle(
  kind: 'start' | 'end',
  nextMinutes: number,
  startMinutes: number,
  endMinutes: number,
): { start: number; end: number } {
  if (kind === 'start') {
    const start = clampWindowStart(nextMinutes, endMinutes);
    return { start, end: endMinutes };
  }
  const end = clampWindowEnd(nextMinutes, startMinutes);
  return { start: startMinutes, end };
}

/** @deprecated Use minutesToClockDegrees */
export const minutesToArcDegrees = minutesToClockDegrees;

/** @deprecated Use clockDegreesToMinutes */
export const arcDegreesToMinutes = clockDegreesToMinutes;

/** @deprecated Full circle is used now */
export const SPENDING_WINDOW_ARC = {
  startDeg: -90,
  sweepDeg: 360,
} as const;
