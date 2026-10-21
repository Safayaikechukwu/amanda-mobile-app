import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

/** Module-level fallback when tab params do not survive a nested-stack → tab switch. */
let pendingMessage: string | null = null;

export function setPendingChatMessage(message: string) {
  pendingMessage = message;
}

export function consumePendingChatMessage(): string | null {
  const message = pendingMessage;
  pendingMessage = null;
  return message;
}

export function peekPendingChatMessage(): string | null {
  return pendingMessage;
}

export function clearPendingChatMessage() {
  pendingMessage = null;
}

type OpenUdaraChatOptions = {
  focusComposer?: boolean;
};

type AppRouter = ReturnType<typeof useRouter>;

/**
 * Switch to the Udara chat tab and optionally pre-fill / auto-send a message.
 * Uses `/` (index tab) so nested savings / profile stacks are left correctly.
 */
export function openUdaraChat(
  router: AppRouter,
  message?: string,
  options?: OpenUdaraChatOptions,
) {
  const trimmed = message?.trim();
  if (trimmed) setPendingChatMessage(trimmed);

  const href = {
    pathname: '/',
    params: {
      ...(trimmed ? { sendMessage: trimmed } : {}),
      ...(options?.focusComposer ? { focusComposer: '1' } : {}),
    },
  } as const;

  // Web: dismissTo does not cross tab navigators from nested savings/profile stacks.
  if (Platform.OS === 'web') {
    router.replace(href);
    return;
  }

  // Native: pop nested stacks back to the chat tab.
  if ('dismissTo' in router && typeof router.dismissTo === 'function') {
    router.dismissTo(href);
    return;
  }

  router.replace(href);
}
