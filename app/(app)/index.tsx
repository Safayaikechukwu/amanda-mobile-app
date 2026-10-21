import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Composer, type ChatMessage } from '@/components/app/Composer';
import { ChatMessageBubble, bubbleGroupPosition } from '@/components/chat/ChatMessageBubble';
import { UdaraMarkIcon } from '@/components/icons/UdaraMarkIcon';
import { ProfileNavButton } from '@/components/ui/ProfileAvatar';
import { ScrollEdgeBlur } from '@/components/ui/ScrollEdgeBlur';
import type { Attachment } from '@/helpers/attachments';
import {
  buildNameWelcome,
  buildNewUserGreeting,
  buildReturningUserGreeting,
  CHAT_GREETING_ID,
  isGreetingOnlyThread,
} from '@/helpers/chatGreeting';
import { useAuth } from '@/context/AuthContext';
import { useMoneyControls } from '@/context/MoneyControlsContext';
import { usePreferences } from '@/context/PreferencesContext';
import { AppTheme } from '@/constants/AppTheme';
import { isAccountNumberText } from '@/helpers/clipboardAccount';
import { consumePendingChatMessage, peekPendingChatMessage, clearPendingChatMessage } from '@/helpers/openUdaraChat';
import { setupNotificationsAfterSignup } from '@/helpers/notifications';
import {
  buildSpendingWindowAppliedReply,
  buildSpendingWindowHelpReply,
  isSpendingWindowChatMessage,
  tryParseSpendingWindowRequest,
} from '@/helpers/spendingWindowChat';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<ChatMessage>);

function replyFor(text: string, attachments: Attachment[]): string {
  if (attachments.some((a) => a.kind === 'audio')) {
    return text.trim()
      ? "Got your voice note. I'll use what you said — ask me to repeat anything if I missed it."
      : "Got your voice note. Tap play anytime to listen again.";
  }
  if (attachments.some((a) => a.kind === 'image')) {
    return "Got your image. I'll read the receipt and match it to a category when Insight sync is live.";
  }
  if (attachments.some((a) => a.kind === 'document')) {
    return `Attached “${attachments[0]?.name}”. I can summarise statements once document parsing is connected.`;
  }
  if (/i want to add a subscription|add subscription/i.test(text)) {
    return 'Tell me the service and monthly amount — I’ll track it in Insights for you.';
  }
  if (/savings goal|update my.*goal|create a savings goal/i.test(text)) {
    return 'Got it — tell me if you want to top up, change your target, or break this goal.';
  }
  if (/i want to add money|add ₦|add money/i.test(text)) {
    return "Okay — I'll start an Add money flow for that amount. Confirm in Savings when you're ready.";
  }
  if (/i want to pay|pay bill|bills? due|electricity|dstv|airtime/i.test(text)) {
    return 'I can help you pay a bill — open Bills or tell me which one (electricity, airtime, TV, etc.). Learn more: https://paystack.com';
  }
  if (/record a transaction|record transaction/i.test(text)) {
    return 'Got it. Did you spend money, receive money, or skip something you almost bought? Share the amount and what it was for — e.g. “₦4,500 on lunch” or “₦120,000 salary in”.';
  }
  if (isAccountNumberText(text)) {
    const acct = text.replace(/\D/g, '');
    return `Got account ${acct}. Which bank is this for, and how much should I send?`;
  }
  if (/spend|food|week|budget/i.test(text)) {
    return 'This week you’re tracking food under Insights. Open Overview → Where it went for the breakdown.';
  }
  return "I'm listening. Ask about spending, bills, or savings — or attach a receipt with +.";
}

export default function AiHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { focusComposer, sendMessage } = useLocalSearchParams<{
    focusComposer?: string;
    sendMessage?: string;
  }>();
  const { user, needsNotificationSetup, completeNotificationSetup, updateUserName } = useAuth();
  const { setPushNotifications, formatAmount } = usePreferences();
  const { handleSpendingWindowChat } = useMoneyControls();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const scrollY = useSharedValue(0);
  const notificationPrompted = useRef(false);
  const sentParamRef = useRef<string | null>(null);
  const greetingSeeded = useRef(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [voiceActive, setVoiceActive] = useState(false);
  const isNewUser = !user?.name?.trim();

  const onSend = useCallback((payload: { text: string; attachments: Attachment[] }) => {
    const body = payload.text.trim();
    if (!body && payload.attachments.length === 0) return;

    const awaitingName = isNewUser && isGreetingOnlyThread(messages);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: body,
      attachments: payload.attachments,
    };

    let botText: string;
    if (awaitingName && body && payload.attachments.length === 0) {
      botText = buildNameWelcome(body);
      void updateUserName(body);
    } else if (/^set my spending window to/i.test(body)) {
      const parsed = tryParseSpendingWindowRequest(body);
      botText = parsed
        ? buildSpendingWindowAppliedReply(parsed.start, parsed.end)
        : buildSpendingWindowHelpReply();
    } else {
      const windowReply = handleSpendingWindowChat(body);
      if (windowReply) {
        botText = windowReply;
      } else if (isSpendingWindowChatMessage(body)) {
        botText = buildSpendingWindowHelpReply();
      } else {
        botText = replyFor(body, payload.attachments);
      }
    }

    const botMsg: ChatMessage = {
      id: `a-${Date.now() + 1}`,
      role: 'udara',
      text: botText,
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, [handleSpendingWindowChat, isNewUser, messages, updateUserName]);

  const empty = messages.length === 0;
  const showWatermark = empty && !voiceActive;

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useEffect(() => {
    if (greetingSeeded.current || !user) return;
    greetingSeeded.current = true;
    const text = isNewUser
      ? buildNewUserGreeting()
      : buildReturningUserGreeting(user.name, formatAmount);
    setMessages([
      {
        id: CHAT_GREETING_ID,
        role: 'udara',
        text,
      },
    ]);
  }, [user, isNewUser, formatAmount]);

  useEffect(() => {
    if (!needsNotificationSetup || notificationPrompted.current) return;
    notificationPrompted.current = true;

    const timer = setTimeout(() => {
      void (async () => {
        await setupNotificationsAfterSignup(user?.id);
        await setPushNotifications(true);
        await completeNotificationSetup();
      })();
    }, 500);

    return () => clearTimeout(timer);
  }, [needsNotificationSetup, completeNotificationSetup, setPushNotifications, user?.id]);

  const pendingSendRef = useRef<string | null>(null);

  const flushPrefilledMessage = useCallback(() => {
    const fromParam = sendMessage?.trim();
    const fromPending = pendingSendRef.current ?? peekPendingChatMessage();
    const text = fromParam || fromPending;
    if (!text || !user || messages.length === 0) return;
    if (sentParamRef.current === text) {
      pendingSendRef.current = null;
      clearPendingChatMessage();
      return;
    }
    sentParamRef.current = text;
    pendingSendRef.current = null;
    clearPendingChatMessage();
    onSend({ text, attachments: [] });
    router.setParams({ sendMessage: undefined });
  }, [messages.length, onSend, router, sendMessage, user]);

  useEffect(() => {
    if (!sendMessage?.trim()) {
      sentParamRef.current = null;
    }
  }, [sendMessage]);

  useEffect(() => {
    flushPrefilledMessage();
  }, [flushPrefilledMessage]);

  useFocusEffect(
    useCallback(() => {
      const pending = consumePendingChatMessage();
      if (pending) pendingSendRef.current = pending;
      flushPrefilledMessage();
    }, [flushPrefilledMessage]),
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
      <View style={styles.inner}>
        <StatusBar style="dark" />

        {showWatermark ? (
          <View style={styles.hero} pointerEvents="none">
            <View style={styles.watermark}>
              <UdaraMarkIcon size={100} color={AppTheme.accent} />
            </View>
          </View>
        ) : messages.length > 0 ? (
          <View style={styles.threadWrap}>
            <AnimatedFlatList
              ref={listRef}
              data={messages}
              keyExtractor={(m) => m.id}
              contentContainerStyle={[
                styles.thread,
                { paddingTop: insets.top + 44 },
              ]}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={onScroll}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
              renderItem={({ item, index }) => (
                <ChatMessageBubble
                  message={item}
                  groupPosition={bubbleGroupPosition(messages, index)}
                  groupedWithPrevious={index > 0 && messages[index - 1]?.role === item.role}
                  isFirstInThread={index === 0}
                />
              )}
            />
          </View>
        ) : (
          <View style={styles.heroFill} />
        )}

        {messages.length > 0 ? (
          <ScrollEdgeBlur
            edge="top"
            scrollY={scrollY}
            style={{ height: insets.top + 56 }}
          />
        ) : null}

        <View style={[styles.profileFloat, { top: insets.top + 6 }]}>
          <ProfileNavButton onPress={() => router.push('/(app)/profile')} />
        </View>

        <Composer
          messages={messages}
          onSend={onSend}
          onVoiceActiveChange={setVoiceActive}
          autoFocusOnMount={focusComposer === '1'}
          showActionChips={!isNewUser}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppTheme.bg },
  inner: { flex: 1, backgroundColor: AppTheme.bg },
  profileFloat: {
    position: 'absolute',
    right: 16,
    zIndex: 20,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFill: { flex: 1 },
  threadWrap: {
    flex: 1,
    position: 'relative',
  },
  watermark: {
    opacity: 0.14,
  },
  thread: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
});
