/** Opening chat copy and spending limits for Udara greetings. */

import { MockSpendingLimits } from '@/constants/MoneyControls';

export const CHAT_GREETING_ID = 'udara-greeting';

export { MockSpendingLimits };

export function firstName(fullName: string | null | undefined): string {
  const trimmed = fullName?.trim();
  if (!trimmed) return 'there';
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

export function buildNewUserGreeting(): string {
  return "Hey! My name is Udara. What's your name?";
}

export function buildReturningUserGreeting(
  name: string | null | undefined,
  formatAmount: (amount: number) => string,
): string {
  const who = firstName(name);
  const daily = formatAmount(MockSpendingLimits.daily);
  const weekly = formatAmount(MockSpendingLimits.weekly);
  return `Hey ${who} — ${daily} left today, ${weekly} this week. What do you want to do?`;
}

export function buildNameWelcome(name: string): string {
  const who = firstName(name);
  return `Nice to meet you, ${who}! I'm here to help you save smarter, stay on budget, and handle money without the stress. What would you like to start with?`;
}

export function isGreetingOnlyThread(
  messages: { id: string; role: string }[],
): boolean {
  return messages.length === 1 && messages[0].id === CHAT_GREETING_ID && messages[0].role === 'udara';
}
