const NUBAN_LENGTH = 10;

/** Nigerian NUBAN-style account numbers (10 digits). */
export function extractAccountNumber(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const digitsOnly = trimmed.replace(/\D/g, '');

  // Phone numbers are 11 digits — ignore those.
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) return null;

  if (/^[\d\s\-]+$/.test(trimmed) && digitsOnly.length === NUBAN_LENGTH) {
    return digitsOnly;
  }

  const match = trimmed.match(/\b(\d[\d\s\-]{8,12}\d)\b/);
  if (match) {
    const candidate = match[1].replace(/\D/g, '');
    if (candidate.length === NUBAN_LENGTH) return candidate;
  }

  return null;
}

export function formatAccountNumber(account: string): string {
  const d = account.replace(/\D/g, '').slice(0, NUBAN_LENGTH);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

export function isAccountNumberText(text: string): boolean {
  return extractAccountNumber(text) !== null;
}
