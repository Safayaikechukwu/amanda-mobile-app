import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { VoiceNoteBubble } from '@/components/chat/VoiceNoteBubble';
import { LinkifiedText } from '@/components/ui/LinkifiedText';
import type { ChatMessage } from '@/components/app/Composer';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';

export type BubbleGroupPosition = 'single' | 'first' | 'middle' | 'last';

type Props = {
  message: ChatMessage;
  groupPosition: BubbleGroupPosition;
  groupedWithPrevious: boolean;
  isFirstInThread?: boolean;
};

const MEDIA_WIDTH = 168;
const MEDIA_MAX_HEIGHT = 200;
const R = 16;
const GROUP = 4;
const TAIL = 2;

export function bubbleGroupPosition(messages: ChatMessage[], index: number): BubbleGroupPosition {
  const role = messages[index]?.role;
  const samePrev = index > 0 && messages[index - 1]?.role === role;
  const sameNext = index < messages.length - 1 && messages[index + 1]?.role === role;
  if (!samePrev && !sameNext) return 'single';
  if (!samePrev && sameNext) return 'first';
  if (samePrev && sameNext) return 'middle';
  return 'last';
}

function hasVisualMedia(message: ChatMessage): boolean {
  return Boolean(message.attachments?.some((a) => a.kind === 'image'));
}

function bubbleRadii(isUser: boolean, position: BubbleGroupPosition): ViewStyle {
  if (isUser) {
    switch (position) {
      case 'first':
        return {
          borderTopLeftRadius: R,
          borderTopRightRadius: R,
          borderBottomLeftRadius: R,
          borderBottomRightRadius: GROUP,
        };
      case 'middle':
        return {
          borderTopLeftRadius: R,
          borderTopRightRadius: GROUP,
          borderBottomLeftRadius: R,
          borderBottomRightRadius: GROUP,
        };
      case 'last':
        return {
          borderTopLeftRadius: R,
          borderTopRightRadius: GROUP,
          borderBottomLeftRadius: R,
          borderBottomRightRadius: TAIL,
        };
      default:
        return {
          borderTopLeftRadius: R,
          borderTopRightRadius: R,
          borderBottomLeftRadius: R,
          borderBottomRightRadius: TAIL,
        };
    }
  }

  switch (position) {
    case 'first':
      return {
        borderTopLeftRadius: R,
        borderTopRightRadius: R,
        borderBottomLeftRadius: GROUP,
        borderBottomRightRadius: R,
      };
    case 'middle':
      return {
        borderTopLeftRadius: GROUP,
        borderTopRightRadius: R,
        borderBottomLeftRadius: GROUP,
        borderBottomRightRadius: R,
      };
    case 'last':
      return {
        borderTopLeftRadius: GROUP,
        borderTopRightRadius: R,
        borderBottomLeftRadius: TAIL,
        borderBottomRightRadius: R,
      };
    default:
      return {
        borderTopLeftRadius: R,
        borderTopRightRadius: R,
        borderBottomLeftRadius: TAIL,
        borderBottomRightRadius: R,
      };
  }
}

export function ChatMessageBubble({
  message,
  groupPosition,
  groupedWithPrevious,
  isFirstInThread = false,
}: Props) {
  const isUser = message.role === 'user';
  const attachments = message.attachments ?? [];
  const hasImage = attachments.some((a) => a.kind === 'image');
  const hasText = Boolean(message.text?.trim());
  const mediaOnly =
    hasImage && !hasText && attachments.length === 1 && attachments[0]?.kind === 'image';
  const radii = bubbleRadii(isUser, groupPosition);

  const rowStyle = groupedWithPrevious
    ? styles.rowGrouped
    : isFirstInThread
      ? undefined
      : styles.rowSpaced;

  if (isUser) {
    return (
      <View style={[styles.row, rowStyle]}>
        <View
          style={[
            styles.userShell,
            radii,
            hasImage && styles.userMediaShell,
            mediaOnly && styles.userMediaOnly,
          ]}>
          {attachments.map((a) =>
            a.kind === 'audio' ? (
              <VoiceNoteBubble key={a.id} uri={a.uri} durationMs={a.durationMs} variant="user" />
            ) : a.kind === 'image' ? (
              <Image
                key={a.id}
                source={{ uri: a.uri }}
                style={styles.mediaImage}
                resizeMode="cover"
              />
            ) : (
              <View key={a.id} style={styles.docRow}>
                <Ionicons name="document-text-outline" size={16} color="#fff" />
                <Text style={[styles.docName, styles.docNameOnDark]} numberOfLines={1}>
                  {a.name}
                </Text>
              </View>
            ),
          )}
          {hasText ? (
            <View style={[styles.caption, hasImage && styles.captionOnMedia]}>
              <LinkifiedText style={[styles.body, styles.bodyOnDark]} variant="onDark">
                {message.text}
              </LinkifiedText>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, rowStyle]}>
      <View style={[styles.botShell, radii, hasImage && styles.botMediaShell]}>
        {attachments.map((a) =>
          a.kind === 'audio' ? (
            <VoiceNoteBubble key={a.id} uri={a.uri} durationMs={a.durationMs} variant="bot" />
          ) : a.kind === 'image' ? (
            <Image
              key={a.id}
              source={{ uri: a.uri }}
              style={styles.mediaImageBot}
              resizeMode="cover"
            />
          ) : (
            <View key={a.id} style={styles.docRow}>
              <Ionicons name="document-text-outline" size={16} color={AppTheme.text} />
              <Text style={styles.docName} numberOfLines={1}>
                {a.name}
              </Text>
            </View>
          ),
        )}
        {hasText ? (
          <LinkifiedText style={[styles.body, hasVisualMedia(message) && styles.bodyAfterMedia]}>
            {message.text}
          </LinkifiedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
  },
  rowSpaced: {
    marginTop: 6,
  },
  rowGrouped: {
    marginTop: 2,
  },
  userShell: {
    maxWidth: '68%',
    alignSelf: 'flex-end',
    backgroundColor: AppTheme.accent,
    paddingHorizontal: 11,
    paddingVertical: 6,
    gap: 4,
  },
  userMediaShell: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingTop: 0,
    overflow: 'hidden',
    gap: 0,
  },
  userMediaOnly: {
    paddingBottom: 0,
  },
  botShell: {
    maxWidth: '68%',
    alignSelf: 'flex-start',
    backgroundColor: '#e9e9eb',
    paddingHorizontal: 11,
    paddingVertical: 6,
    gap: 4,
  },
  botMediaShell: {
    paddingHorizontal: 0,
    paddingTop: 0,
    overflow: 'hidden',
    gap: 0,
  },
  mediaImage: {
    width: MEDIA_WIDTH,
    aspectRatio: 1,
    maxHeight: MEDIA_MAX_HEIGHT,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  mediaImageBot: {
    width: MEDIA_WIDTH,
    aspectRatio: 1,
    maxHeight: MEDIA_MAX_HEIGHT,
    backgroundColor: 'rgba(74, 5, 8, 0.06)',
  },
  caption: {
    paddingHorizontal: 11,
    paddingBottom: 6,
  },
  captionOnMedia: {
    paddingTop: 6,
  },
  body: {
    color: AppTheme.text,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: FontFamily.regular,
    letterSpacing: -0.1,
  },
  bodyOnDark: {
    color: '#fff',
  },
  bodyAfterMedia: {
    paddingHorizontal: 11,
    paddingBottom: 6,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docName: {
    flex: 1,
    color: AppTheme.text,
    fontSize: 13,
    fontFamily: FontFamily.medium,
  },
  docNameOnDark: {
    color: '#fff',
  },
});
