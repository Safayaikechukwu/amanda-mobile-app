/** True only on Insights, Udara home, and Savings home — not drill-down screens. */
export function isMainTabPath(pathname: string): boolean {
  const path = pathname.replace(/^\/\(app\)/, '') || '/';
  return path === '/insights' || path === '/savings' || path === '/' || path === '/index';
}

/** @deprecated use isMainTabPath — segments in tab layout omit nested stack routes */
export function isMainTabScreen(segments: string[]): boolean {
  if (segments.length === 0) return true;
  if (segments.length !== 1) return false;
  return segments[0] === 'insights' || segments[0] === 'index' || segments[0] === 'savings';
}
