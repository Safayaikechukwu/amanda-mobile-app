import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type NativeSyntheticEvent,
  type TextInputContentSizeChangeEventData,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ComposerImageStack } from '@/components/app/ComposerImageStack';
import {
  captureReceiptPhoto,
  pickDocument,
  pickPhotoFromLibrary,
  type Attachment,
} from '@/helpers/attachments';
import { CHAT_GREETING_ID } from '@/helpers/chatGreeting';
import { useVoiceSession } from '@/hooks/useVoiceSession';
import { useClipboardAccountSuggestion } from '@/hooks/useClipboardAccountSuggestion';
import { formatAccountNumber } from '@/helpers/clipboardAccount';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { GlassPressable } from '@/components/ui/GlassPressable';
import { CloseIconButton } from '@/components/ui/CloseIconButton';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';

const WELL = '#dddddd';
const BRAND_ON = '#ffffff';
const VOICE_BG = '#1a1a1a';
const INPUT_LINE_HEIGHT = 20;
const INPUT_MIN_HEIGHT = 40;
/** Toolbar, bar padding, and bottom inset — subtracted from half-screen cap. */
const COMPOSER_CHROME = 96;
const PLUS_MENU_GAP = 8;
const ACCENT_TINT = AppTheme.accent;
const MAX_IMAGES_PER_MESSAGE = 1;
const IMAGE_LIMIT_HINT = 'One photo per message';

function AccentGlassButton({
  onPress,
  accessibilityLabel,
  children,
  pill,
  style,
  onDark,
  disabled,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
  pill?: boolean;
  style?: object;
  onDark?: boolean;
  disabled?: boolean;
}) {
  const tint = onDark ? 'rgba(255,255,255,0.55)' : ACCENT_TINT;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [pressed && !disabled && styles.pressed, disabled && styles.inactive]}>
      <LiquidGlass
        style={[
          styles.accentGlass,
          pill ? styles.speakGlass : styles.wellGlass,
          style,
        ]}
        surface={onDark ? 'frosted' : 'accent'}
        intensity={onDark ? 28 : 40}
        tintColor={tint}
        washColor={onDark ? 'rgba(255,255,255,0.14)' : undefined}
        contentStyle={[
          styles.accentGlassInner,
          pill ? styles.speakInner : styles.wellInner,
          style,
        ]}>
        {children}
      </LiquidGlass>
    </Pressable>
  );
}

type Chip = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type PlusMenuItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  hint?: string;
};

function PlusMenuRow({
  label,
  icon,
  onPress,
  disabled = false,
  hint,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.plusMenuRow,
        disabled && styles.plusMenuRowDisabled,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={disabled && hint ? `${label}. ${hint}` : label}>
      <LiquidGlass
        style={styles.plusMenuIconGlass}
        intensity={disabled ? 28 : 44}
        tintColor={disabled ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.72)'}
        washColor={disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.38)'}
        contentStyle={styles.plusMenuIconInner}>
        <Ionicons name={icon} size={17} color={disabled ? AppTheme.textFaint : AppTheme.accent} />
      </LiquidGlass>
      <View style={styles.plusMenuCopy}>
        <Text style={[styles.plusMenuLabel, disabled && styles.plusMenuLabelDisabled]}>{label}</Text>
        {disabled && hint ? <Text style={styles.plusMenuHint}>{hint}</Text> : null}
      </View>
    </Pressable>
  );
}

const ACTION_CHIPS: Chip[] = [
  { label: 'Add money', icon: 'add-circle-outline' },
  { label: 'Pay bill', icon: 'receipt-outline' },
  { label: 'Record transaction', icon: 'create-outline' },
];

function chipPrompt(label: string): string {
  if (label === 'Add money') return 'I want to add money';
  if (label === 'Pay bill') return 'I want to pay a bill';
  if (label === 'Record transaction') return 'I want to record a transaction';
  return `I want to ${label.toLowerCase()}`;
}

export type ChatMessage = {
  id: string;
  role: 'user' | 'udara';
  text: string;
  attachments?: Attachment[];
};

type Props = {
  compactBottom?: boolean;
  messages: ChatMessage[];
  onSend: (payload: { text: string; attachments: Attachment[] }) => void;
  onComposerFocusChange?: (focused: boolean) => void;
  onVoiceActiveChange?: (active: boolean) => void;
  autoFocusOnMount?: boolean;
  /** Hide quick-action chips during onboarding or other flows. */
  showActionChips?: boolean;
};

export function Composer({
  compactBottom = true,
  messages,
  onSend,
  onComposerFocusChange,
  onVoiceActiveChange,
  autoFocusOnMount = false,
  showActionChips = true,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const maxInputHeight = Math.max(
    INPUT_MIN_HEIGHT,
    Math.round(windowHeight * 0.5 - COMPOSER_CHROME),
  );
  const inputRef = useRef<TextInput>(null);
  const plusBtnRef = useRef<View>(null);
  const [text, setText] = useState('');
  const [inputHeight, setInputHeight] = useState(INPUT_MIN_HEIGHT);
  const [plusOpen, setPlusOpen] = useState(false);
  const [plusAnchor, setPlusAnchor] = useState<{ left: number; bottom: number } | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [moneyOpen, setMoneyOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const voice = useVoiceSession();
  const clipboard = useClipboardAccountSuggestion({ enabled: !voice.isActive });
  const appliedClipboardRef = useRef<string | null>(null);

  const greetingOnly =
    messages.length === 1 && messages[0]?.role === 'udara' && messages[0]?.id === CHAT_GREETING_ID;
  const showSuggestions =
    showActionChips &&
    !voice.isActive &&
    text.trim().length === 0 &&
    attachments.length === 0 &&
    (messages.length === 0 || greetingOnly);
  const showClipboardChip =
    !voice.isActive &&
    clipboard.accountNumber !== null &&
    attachments.length === 0 &&
    text.trim().length === 0 &&
    appliedClipboardRef.current !== clipboard.accountNumber;
  const hasText = text.trim().length > 0 || attachments.length > 0;
  const inputScrollable = inputHeight >= maxInputHeight;

  const onInputContentSizeChange = (
    event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
  ) => {
    const next = Math.ceil(event.nativeEvent.contentSize.height);
    setInputHeight(Math.min(Math.max(next, INPUT_MIN_HEIGHT), maxInputHeight));
  };

  useEffect(() => {
    setInputHeight((height) => Math.min(Math.max(height, INPUT_MIN_HEIGHT), maxInputHeight));
  }, [maxInputHeight]);

  useEffect(() => {
    if (!text.trim()) setInputHeight(INPUT_MIN_HEIGHT);
  }, [text]);

  const sendAccountNumber = (account: string) => {
    appliedClipboardRef.current = account;
    clipboard.dismiss();
    onSend({ text: account, attachments: [] });
    Keyboard.dismiss();
  };

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    onVoiceActiveChange?.(voice.isActive);
  }, [voice.isActive, onVoiceActiveChange]);

  useFocusEffect(
    useCallback(() => {
      if (!autoFocusOnMount) return;
      const t = setTimeout(() => inputRef.current?.focus(), 450);
      return () => clearTimeout(t);
    }, [autoFocusOnMount]),
  );

  useEffect(() => {
    if (!clipboard.accountNumber || voice.isActive) return;
    if (appliedClipboardRef.current === clipboard.accountNumber) return;
    if (text.trim().length > 0 || attachments.length > 0) return;
    sendAccountNumber(clipboard.accountNumber);
  }, [clipboard.accountNumber, voice.isActive, text, attachments]);

  const sendFromClipboard = async () => {
    const account = (await clipboard.applyFromClipboard()) ?? clipboard.accountNumber;
    if (!account || appliedClipboardRef.current === account) return;
    sendAccountNumber(account);
  };

  const dismissClipboard = () => {
    if (clipboard.accountNumber) {
      appliedClipboardRef.current = clipboard.accountNumber;
    }
    clipboard.dismiss();
  };

  const flashDenied = () => {
    /* permission alerts live in helpers */
  };

  const submit = (body?: string) => {
    const payload = (body ?? text).trim();
    if (!payload && attachments.length === 0) return;
    onSend({ text: payload, attachments });
    setText('');
    setAttachments([]);
    void voice.reset();
    Keyboard.dismiss();
  };

  const startSpeak = async () => {
    Keyboard.dismiss();
    await voice.start();
  };

  const onPauseOrResume = async () => {
    if (voice.status === 'recording') {
      await voice.pause();
      return;
    }
    if (voice.status === 'paused') {
      await voice.resume();
    }
  };

  const onSendVoice = async () => {
    let draft = text.trim() || voice.transcript.trim();
    let audioUri: string | undefined;
    let durationMs: number | undefined;

    if (voice.status === 'recording' || voice.status === 'paused' || voice.status === 'transcribing') {
      const result = await voice.finishAndTranscribe();
      draft = result.text.trim() || draft;
      audioUri = result.audioUri;
      durationMs = result.durationMs;
    }

    const attachments: Attachment[] = audioUri
      ? [
          {
            id: `voice-${Date.now()}`,
            kind: 'audio',
            uri: audioUri,
            name: 'Voice note',
            mimeType: Platform.OS === 'web' ? 'audio/webm' : 'audio/m4a',
            durationMs,
          },
        ]
      : [];

    if (!draft && attachments.length === 0) return;

    onSend({ text: draft, attachments });
    setText('');
    setAttachments([]);
    void voice.reset();
    Keyboard.dismiss();
  };

  const addAttachment = (a: Attachment | null) => {
    if (!a) {
      flashDenied();
      return;
    }
    setAttachments((prev) => {
      if (a.kind === 'image') {
        const imageCount = prev.filter((x) => x.kind === 'image').length;
        if (imageCount >= MAX_IMAGES_PER_MESSAGE) return prev;
      }
      return [...prev, a];
    });
    closePlusMenu();
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((x) => x.id !== id));
  };

  const pickPhoto = async (source: 'library' | 'camera') => {
    if (attachments.some((a) => a.kind === 'image')) return;
    const file =
      source === 'library' ? await pickPhotoFromLibrary() : await captureReceiptPhoto();
    addAttachment(file);
  };

  const choosePhoto = () => {
    void pickPhoto('library');
  };

  const chooseCamera = () => {
    void pickPhoto('camera');
  };

  const chooseDocument = () => {
    closePlusMenu();
    void (async () => {
      addAttachment(await pickDocument());
    })();
  };

  const openMoney = () => {
    setMoneyOpen(true);
  };

  const onChipPress = (label: string) => {
    Keyboard.dismiss();
    if (label === 'Add money') {
      openMoney();
      return;
    }
    submit(chipPrompt(label));
  };

  const closePlusMenu = () => {
    setPlusOpen(false);
    setPlusAnchor(null);
  };

  const togglePlusMenu = () => {
    if (plusOpen) {
      closePlusMenu();
      return;
    }

    Keyboard.dismiss();
    plusBtnRef.current?.measureInWindow((x, y) => {
      const windowH = Dimensions.get('window').height;
      setPlusAnchor({ left: x, bottom: windowH - y + PLUS_MENU_GAP });
      setPlusOpen(true);
    });
  };

  const bottomPad = compactBottom ? 8 : Math.max(insets.bottom, 12);
  const imageAttachments = attachments.filter((a) => a.kind === 'image');
  const docAttachments = attachments.filter((a) => a.kind !== 'image');
  const hasImageAttached = imageAttachments.length >= MAX_IMAGES_PER_MESSAGE;

  const plusMenuItems: PlusMenuItem[] = [
    {
      key: 'camera',
      label: 'Camera',
      icon: 'camera-outline',
      onPress: chooseCamera,
      disabled: hasImageAttached,
      hint: IMAGE_LIMIT_HINT,
    },
    {
      key: 'photos',
      label: 'Photos',
      icon: 'image-outline',
      onPress: choosePhoto,
      disabled: hasImageAttached,
      hint: IMAGE_LIMIT_HINT,
    },
    { key: 'document', label: 'Document', icon: 'attach-outline', onPress: () => void chooseDocument() },
  ];

  if (voice.isActive) {
    const recording = voice.status === 'recording';
    const paused = voice.status === 'paused';
    const transcribing = voice.status === 'transcribing';
    const draft = text.trim() || voice.transcript.trim();
    return (
      <View style={[styles.wrap, styles.wrapVoice, { paddingBottom: bottomPad }]}>
        {draft ? (
          <LiquidGlass style={styles.liveGlass} intensity={50} contentStyle={styles.liveTranscript}>
            <Text style={styles.liveLabel}>{transcribing ? 'Transcribing…' : 'Your message'}</Text>
            <Text style={styles.liveText}>{draft}</Text>
          </LiquidGlass>
        ) : null}
        <View style={styles.voiceBar}>
          <CloseIconButton
            onPress={() => void voice.reset()}
            variant="plain"
            size={18}
            style={styles.voiceBtn}
            accessibilityLabel="Cancel speaking"
          />

          <View style={styles.wave} accessibilityLabel="Voice levels">
            {voice.levels.map((level, i) => (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    height: 5 + level * 24,
                    opacity: recording ? 0.5 + level * 0.5 : 0.35,
                  },
                ]}
              />
            ))}
          </View>

          <AccentGlassButton
            onPress={() => void onPauseOrResume()}
            accessibilityLabel={recording ? 'Pause recording' : 'Resume recording'}
            onDark
            disabled={transcribing}
            style={styles.voiceBtn}>
            <Ionicons
              name={recording ? 'pause' : 'mic-outline'}
              size={recording ? 18 : 16}
              color="#fff"
            />
          </AccentGlassButton>

          <AccentGlassButton
            onPress={() => void onSendVoice()}
            accessibilityLabel="Send voice message"
            disabled={transcribing}
            style={[styles.voiceSend, transcribing && styles.voiceSendDisabled]}>
            <Ionicons name="arrow-up" size={18} color="#fff" />
          </AccentGlassButton>
        </View>
        {!keyboardOpen ? (
          <Text style={styles.voiceHint}>
            {transcribing
              ? 'Transcribing your message…'
              : recording
                ? 'Listening — tap pause to take a break'
                : paused
                  ? 'Paused — tap mic to keep going, or send when ready'
                  : 'Tap Speak to start'}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { paddingBottom: bottomPad }]}>
      {showClipboardChip ? (
        <View style={styles.clipboardChip}>
          <Pressable
            style={({ pressed }) => [styles.clipboardMain, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Send account number ${formatAccountNumber(clipboard.accountNumber!)}`}
            onPress={() => void sendFromClipboard()}>
            <View style={styles.clipboardIcon}>
              <Ionicons name="clipboard-outline" size={16} color={AppTheme.accent} />
            </View>
            <View style={styles.clipboardCopy}>
              <Text style={styles.clipboardLabel}>Account number copied</Text>
              <Text style={styles.clipboardAccount}>
                {formatAccountNumber(clipboard.accountNumber!)}
              </Text>
            </View>
            <Text style={styles.clipboardAction}>Send</Text>
          </Pressable>
          <CloseIconButton
            onPress={dismissClipboard}
            variant="plain"
            size={18}
            style={styles.clipboardDismiss}
            accessibilityLabel="Dismiss clipboard suggestion"
            hitSlop={10}
          />
        </View>
      ) : null}

      {showSuggestions ? (
        <View style={styles.suggestions}>
          {ACTION_CHIPS.map((chip) => (
            <Pressable
              key={chip.label}
              style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
              accessibilityRole="button"
              onPress={() => onChipPress(chip.label)}>
              <Ionicons name={chip.icon} size={18} color={AppTheme.accent} />
              <View style={styles.chipTextWrap}>
                <Text style={styles.chipText} numberOfLines={2}>
                  {chip.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}

      <LiquidGlass
        style={styles.barGlass}
        intensity={52}
        tintColor="rgba(255,255,255,0.78)"
        washColor="rgba(255,255,255,0.38)"
        contentStyle={styles.barInner}>
        {attachments.length > 0 ? (
          <View style={styles.attachArea}>
            {imageAttachments.length > 0 ? (
              <ComposerImageStack images={imageAttachments} onRemove={removeAttachment} />
            ) : null}
            {docAttachments.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.attachDocScroll}
                contentContainerStyle={styles.attachRow}
                keyboardShouldPersistTaps="handled">
                {docAttachments.map((a) => (
                  <View key={a.id} style={styles.attachChip}>
                    <View style={styles.attachDoc}>
                      <Ionicons name="document-text-outline" size={18} color={AppTheme.text} />
                    </View>
                    <Text style={styles.attachName} numberOfLines={1}>
                      {a.name}
                    </Text>
                    <CloseIconButton
                      onPress={() => removeAttachment(a.id)}
                      icon="close-circle"
                      variant="plain"
                      size={18}
                      accessibilityLabel="Remove attachment"
                    />
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </View>
        ) : null}

        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder="Ask anything"
          placeholderTextColor={AppTheme.textMuted}
          style={[
            styles.input,
            {
              height: inputHeight,
              maxHeight: maxInputHeight,
            },
          ]}
          multiline
          scrollEnabled={inputScrollable}
          onContentSizeChange={onInputContentSizeChange}
          textAlignVertical="top"
          underlineColorAndroid="transparent"
          selectionColor={AppTheme.accent}
          onFocus={() => onComposerFocusChange?.(true)}
          onBlur={() => onComposerFocusChange?.(false)}
        />

        <View style={styles.toolbar}>
          <View ref={plusBtnRef} collapsable={false}>
            <AccentGlassButton
              onPress={togglePlusMenu}
              accessibilityLabel={plusOpen ? 'Close attachment menu' : 'Add attachment'}>
              <Ionicons name={plusOpen ? 'close' : 'add'} size={20} color={BRAND_ON} />
            </AccentGlassButton>
          </View>

          <AccentGlassButton
            onPress={() => (hasText ? submit() : void startSpeak())}
            accessibilityLabel={hasText ? 'Send' : 'Speak'}
            pill={!hasText}
            style={hasText ? styles.send : styles.speak}>
            {hasText ? (
              <Ionicons name="arrow-up" size={18} color="#fff" />
            ) : (
              <>
                <Ionicons name="mic-outline" size={16} color="#fff" />
                <Text style={styles.speakLabel}>Speak</Text>
              </>
            )}
          </AccentGlassButton>
        </View>
      </LiquidGlass>

      <Modal visible={plusOpen} transparent animationType="fade" onRequestClose={closePlusMenu}>
        <Pressable style={styles.plusBackdrop} onPress={closePlusMenu}>
          {plusAnchor ? (
            <Pressable
              style={[
                styles.plusMenuAnchor,
                { left: plusAnchor.left, bottom: plusAnchor.bottom },
              ]}
              onPress={(e) => e.stopPropagation()}>
              <LiquidGlass
                style={styles.plusMenuGlass}
                intensity={72}
                tintColor="rgba(255,255,255,0.84)"
                washColor="rgba(255,255,255,0.52)"
                contentStyle={styles.plusMenuInner}>
                <Text style={styles.plusMenuHeading}>Attach</Text>
                {hasImageAttached ? (
                  <Text style={styles.plusMenuNote}>{IMAGE_LIMIT_HINT}</Text>
                ) : null}
                {plusMenuItems.map((item) => (
                  <PlusMenuRow
                    key={item.key}
                    label={item.label}
                    icon={item.icon}
                    onPress={item.onPress}
                    disabled={item.disabled}
                    hint={item.hint}
                  />
                ))}
              </LiquidGlass>
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>

      <Modal visible={moneyOpen} transparent animationType="slide" onRequestClose={() => setMoneyOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMoneyOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LiquidGlass
              style={styles.sheetGlass}
              intensity={72}
              contentStyle={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              <View style={styles.handle} />
              <Text style={styles.sheetTitle}>Add money</Text>
              <Text style={styles.sheetSub}>How much do you want to add?</Text>
              <LiquidGlass style={styles.amountGlass} intensity={45} contentStyle={styles.amountInputWrap}>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="e.g. 50000"
                  placeholderTextColor={AppTheme.textFaint}
                  style={styles.amountInput}
                  autoFocus
                />
              </LiquidGlass>
              <GlassPressable
                label="Continue"
                onPress={() => {
                  const n = amount.replace(/\D/g, '');
                  if (!n) return;
                  setMoneyOpen(false);
                  setAmount('');
                  onSend({ text: `Add ₦${Number(n).toLocaleString('en-NG')} to my balance`, attachments: [] });
                }}
                size="md"
                style={{ marginTop: 8 }}
              />
            </LiquidGlass>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 6,
    backgroundColor: AppTheme.bg,
    flexShrink: 0,
  },
  wrapVoice: {
    backgroundColor: AppTheme.bg,
  },
  clipboardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
    marginHorizontal: 2,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 10,
    borderRadius: 16,
    backgroundColor: '#faf5f5',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(74, 5, 8, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: AppTheme.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  clipboardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  clipboardDismiss: {
    padding: 4,
  },
  clipboardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clipboardCopy: { flex: 1, gap: 1 },
  clipboardLabel: {
    color: AppTheme.textMuted,
    fontSize: 11,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  clipboardAccount: {
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.4,
  },
  clipboardAction: {
    color: AppTheme.accent,
    fontSize: 14,
    fontFamily: FontFamily.semibold,
  },
  suggestions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
    paddingBottom: 10,
    paddingHorizontal: 2,
  },
  chip: {
    flex: 1,
    height: 80,
    minHeight: 80,
    maxHeight: 80,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 11,
    paddingBottom: 11,
    borderRadius: 14,
    backgroundColor: AppTheme.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(60,60,67,0.14)',
    overflow: 'hidden',
  },
  chipTextWrap: {
    height: 32,
    width: '100%',
    justifyContent: 'flex-start',
  },
  chipText: {
    color: AppTheme.text,
    fontSize: 13,
    lineHeight: 16,
    fontFamily: FontFamily.medium,
    letterSpacing: -0.2,
  },
  attachArea: {
    gap: 8,
    marginBottom: 8,
  },
  attachDocScroll: {
    flexGrow: 0,
  },
  attachRow: { gap: 8, paddingRight: 4, alignItems: 'center' },
  attachChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 5, 8, 0.06)',
    maxWidth: 200,
  },
  attachDoc: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: WELL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachName: {
    flex: 1,
    color: AppTheme.text,
    fontSize: 12,
    fontFamily: FontFamily.medium,
  },
  barGlass: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  barInner: {
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  input: {
    color: AppTheme.text,
    fontSize: 15,
    lineHeight: INPUT_LINE_HEIGHT,
    fontFamily: FontFamily.regular,
    minHeight: INPUT_MIN_HEIGHT,
    paddingHorizontal: 4,
    paddingVertical: 0,
    marginBottom: 6,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          boxShadow: 'none',
          overflowY: 'auto',
          resize: 'none',
        } as object)
      : null),
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  accentGlass: {
    overflow: 'hidden',
  },
  accentGlassInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wellGlass: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  wellInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  speakGlass: {
    height: 36,
    borderRadius: 18,
  },
  speakInner: {
    flexDirection: 'row',
    height: 36,
    paddingHorizontal: 14,
    gap: 6,
    borderRadius: 18,
  },
  speak: {
    width: 'auto',
  },
  send: {
    width: 36,
    paddingHorizontal: 0,
  },
  speakLabel: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.2,
  },
  liveGlass: { borderRadius: 16, marginBottom: 12 },
  liveTranscript: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  liveLabel: {
    color: AppTheme.textFaint,
    fontSize: 11,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  liveText: {
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.regular,
    lineHeight: 21,
  },
  voiceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: VOICE_BG,
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 8,
    minHeight: 56,
  },
  voiceBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  voiceSend: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  voiceSendDisabled: {
    opacity: 0.55,
  },
  inactive: {
    opacity: 0.55,
  },
  wave: {
    flex: 1,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 4,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: '#cfcfcf',
  },
  voiceHint: {
    marginTop: 8,
    textAlign: 'center',
    color: AppTheme.textMuted,
    fontSize: 12,
    fontFamily: FontFamily.medium,
  },
  plusBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  plusMenuAnchor: {
    position: 'absolute',
  },
  plusMenuGlass: {
    borderRadius: 18,
    overflow: 'hidden',
    minWidth: 196,
    ...Platform.select({
      ios: {
        shadowColor: '#0d0d0d',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: { elevation: 10 },
      default: {
        boxShadow: '0 10px 32px rgba(13,13,13,0.12)',
      },
    }),
  },
  plusMenuInner: {
    paddingTop: 10,
    paddingBottom: 6,
  },
  plusMenuHeading: {
    color: AppTheme.textFaint,
    fontSize: 11,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  plusMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  plusMenuRowDisabled: {
    opacity: 0.72,
  },
  plusMenuCopy: {
    flex: 1,
    gap: 1,
  },
  plusMenuNote: {
    color: AppTheme.textMuted,
    fontSize: 12,
    fontFamily: FontFamily.regular,
    lineHeight: 16,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  plusMenuIconGlass: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  plusMenuIconInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusMenuLabel: {
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.medium,
    letterSpacing: -0.2,
  },
  plusMenuLabelDisabled: {
    color: AppTheme.textFaint,
  },
  plusMenuHint: {
    color: AppTheme.textFaint,
    fontSize: 11,
    fontFamily: FontFamily.regular,
    lineHeight: 14,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheetGlass: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  sheet: {
    paddingHorizontal: AppTheme.edgePadH,
    paddingTop: 10,
    gap: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: AppTheme.borderStrong,
    marginBottom: 12,
  },
  sheetTitle: {
    color: AppTheme.text,
    fontSize: 20,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.4,
  },
  sheetSub: {
    color: AppTheme.textMuted,
    fontSize: 14,
    fontFamily: FontFamily.regular,
    marginBottom: 8,
  },
  amountGlass: { borderRadius: 14, marginTop: 4 },
  amountInputWrap: {
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  amountInput: {
    paddingVertical: 12,
    fontSize: 18,
    fontFamily: FontFamily.semibold,
    color: AppTheme.text,
  },
  pressed: { opacity: 0.75 },
});
