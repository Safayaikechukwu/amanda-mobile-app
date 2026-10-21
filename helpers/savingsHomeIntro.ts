/** Replay Savings home motion only after this idle gap (ms). */
export const SAVINGS_HOME_INTRO_STALE_MS = 10 * 60 * 1000;

let lastSavingsHomeFocusAt: number | null = null;

/** Call when the Savings home screen gains focus. */
export function savingsHomeIntroOnFocus(now = Date.now()): boolean {
  const play =
    lastSavingsHomeFocusAt === null ||
    now - lastSavingsHomeFocusAt >= SAVINGS_HOME_INTRO_STALE_MS;
  lastSavingsHomeFocusAt = now;
  return play;
}

/** Test helper — reset module state between tests. */
export function resetSavingsHomeIntroForTests() {
  lastSavingsHomeFocusAt = null;
}
