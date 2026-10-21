export type TextPart =
  | { type: 'text'; value: string }
  | { type: 'link'; value: string; url: string };

const URL_PATTERN =
  /(\bhttps?:\/\/[^\s<>()[\]{}"']+[^\s<>()[\]{}"'.,;:!?)}\]])|(\bwww\.[^\s<>()[\]{}"']+[^\s<>()[\]{}"'.,;:!?)}\]])/gi;

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

/** Split message text into plain segments and tappable URLs. */
export function parseTextWithLinks(text: string): TextPart[] {
  if (!text) return [{ type: 'text', value: '' }];

  const parts: TextPart[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const matchText = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, index) });
    }

    parts.push({ type: 'link', value: matchText, url: normalizeUrl(matchText) });
    lastIndex = index + matchText.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: 'text', value: text }];
}

export function normalizeLinkUrl(raw: string): string {
  return normalizeUrl(raw);
}

export function isHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function isExternalLinkScheme(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.startsWith('mailto:') ||
    lower.startsWith('tel:') ||
    lower.startsWith('sms:') ||
    lower.startsWith('facetime:')
  );
}
