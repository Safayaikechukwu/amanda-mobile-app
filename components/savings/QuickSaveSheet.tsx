import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AnimatedAmountDisplay,
  type AmountInputSource,
} from '@/components/ui/AnimatedAmountDisplay';
import { BackIconButton } from '@/components/ui/BackIconButton';
import { GlassPressable } from '@/components/ui/GlassPressable';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { formatNaira } from '@/constants/MockInsights';
import type { SavingsBucketId } from '@/constants/MockData';
import { openUdaraChat } from '@/helpers/openUdaraChat';

const CHIPS = [1000, 5000, 10000];
const DAILY_LIMIT_LEFT = 39300;
const UDARA_BALANCE = 193450;
const SURFACE = AppTheme.composer;

const KEYS: (string | 'back')[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'back'],
];

type Props = {
  visible: boolean;
  /** Which savings bucket receives the deposit. Defaults to Spend & Save. */
  bucketId?: SavingsBucketId;
  onClose: () => void;
  onSave: (payload: { amount: number; bucketId: SavingsBucketId }) => void;
};

const webNoOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null;
const CHIP_EASE = Easing.bezier(0.22, 1, 0.36, 1);
/** Match balance row and keypad keys. */
const ROW_HEIGHT = 52;
const ROW_RADIUS = 12;
/** Compact quick-amount pills — smaller than keypad rows. */
const QUICK_CHIP_HEIGHT = 40;

function QuickAmountChip({
  value,
  active,
  onPress,
}: {
  value: number;
  active: boolean;
  onPress: () => void;
}) {
  const selected = useSharedValue(active ? 1 : 0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    selected.value = withTiming(active ? 1 : 0, { duration: 200, easing: CHIP_EASE });
  }, [active, selected]);

  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(selected.value, [0, 1], [SURFACE, AppTheme.accent]),
    transform: [{ scale: 1 - pressed.value * 0.035 }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(selected.value, [0, 1], [AppTheme.text, '#fff']),
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 70, easing: CHIP_EASE });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 140, easing: CHIP_EASE });
      }}
      style={styles.chipPressable}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={formatNaira(value)}>
      <Animated.View style={[styles.chip, chipStyle]}>
        <Animated.Text style={[styles.chipText, labelStyle]}>{formatNaira(value)}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

export function QuickSaveSheet({ visible, bucketId = 'spend-save', onClose, onSave }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [raw, setRaw] = useState('0');
  const [inputSource, setInputSource] = useState<AmountInputSource>('keypad');

  useEffect(() => {
    if (!visible) {
      setRaw('0');
      setInputSource('keypad');
    }
  }, [visible]);

  const amount = useMemo(() => {
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }, [raw]);

  const hasAmount = amount > 0;
  const canSave = hasAmount && amount <= UDARA_BALANCE && amount <= DAILY_LIMIT_LEFT;

  const pushKey = (key: string | 'back') => {
    setInputSource('keypad');
    if (key === 'back') {
      setRaw((prev) => {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      });
      return;
    }
    if (key === '.') {
      setRaw((prev) => (prev.includes('.') ? prev : `${prev}.`));
      return;
    }
    setRaw((prev) => {
      if (prev === '0') return key;
      const [, frac] = prev.split('.');
      if (frac != null && frac.length >= 2) return prev;
      if (prev.replace('.', '').length >= 9) return prev;
      return prev + key;
    });
  };

  const applyChip = (n: number) => {
    setInputSource('chip');
    setRaw(String(n));
  };

  const submit = () => {
    if (!canSave) return;
    onSave({ amount: Math.round(amount), bucketId });
  };

  const topUp = () => {
    onClose();
    openUdaraChat(router, 'I want to add money');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View
        style={[
          styles.root,
          { paddingTop: insets.top + 4, paddingBottom: Math.max(insets.bottom, 20) },
        ]}>
        <View style={styles.nav}>
          <BackIconButton onPress={onClose} accessibilityLabel="Back" variant="solid" />
          <Text style={styles.navTitle}>Enter amount</Text>
          <View style={styles.navSide} />
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.amountBlock}>
            <View style={styles.amountHead}>
              <AnimatedAmountDisplay
                raw={raw}
                hasAmount={hasAmount}
                inputSource={inputSource}
                emptyStyle={styles.amountDisplayEmpty}
              />
              <View style={styles.limitRow}>
                <Text style={styles.limitText}>
                  {formatNaira(DAILY_LIMIT_LEFT)} of daily limit left
                </Text>
                <Ionicons name="information-circle-outline" size={15} color={AppTheme.textFaint} />
              </View>
            </View>
          </View>

          <View style={styles.midSpacer} />

          <View style={styles.lowerBlock}>
          <View style={styles.fundingSection}>
            <View style={styles.balanceCard}>
              <View style={[styles.accountMark, { backgroundColor: AppTheme.accent }]}>
                <Text style={styles.accountMarkText}>U</Text>
              </View>
              <View style={styles.accountCopy}>
                <Text style={styles.accountLabel}>Udara balance</Text>
                <Text style={styles.accountAmount}>{formatNaira(UDARA_BALANCE)}</Text>
              </View>
              <Pressable
                onPress={topUp}
                style={({ pressed }) => [styles.topUpLink, pressed && styles.pressed, webNoOutline]}
                accessibilityRole="button"
                accessibilityLabel="Add money">
                <Ionicons name="add" size={14} color={AppTheme.accent} />
                <Text style={styles.topUpLinkText}>Add money</Text>
              </Pressable>
            </View>

            <View style={styles.chips}>
              {CHIPS.map((n) => (
                <QuickAmountChip
                  key={n}
                  value={n}
                  active={amount === n}
                  onPress={() => applyChip(n)}
                />
              ))}
            </View>
          </View>

          <View style={styles.pad}>
            {KEYS.map((row) => (
              <View key={row.join('-')} style={styles.padRow}>
                {row.map((key) => (
                  <Pressable
                    key={String(key)}
                    onPress={() => pushKey(key)}
                    style={({ pressed }) => [
                      styles.padKey,
                      pressed && styles.padKeyPressed,
                      webNoOutline,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={key === 'back' ? 'Delete' : String(key)}>
                    {key === 'back' ? (
                      <Ionicons name="backspace-outline" size={24} color={AppTheme.text} />
                    ) : (
                      <Text style={styles.padKeyText}>{key}</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <GlassPressable
            label="Save"
            onPress={submit}
            disabled={!canSave}
            size="md"
            accessibilityLabel="Save"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppTheme.bg,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
    minHeight: 48,
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    color: AppTheme.text,
    fontSize: 17,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.2,
  },
  navSide: { width: 40 },
  body: {
    flex: 1,
  },
  bodyContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    minHeight: '100%',
  },
  midSpacer: {
    flex: 1,
    minHeight: 32,
  },
  lowerBlock: {
    gap: 8,
    marginTop: 'auto' as const,
  },
  fundingSection: {
    gap: 8,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: ROW_RADIUS,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppTheme.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  accountMark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountMarkText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: FontFamily.bold,
  },
  accountCopy: { flex: 1, gap: 2, minWidth: 0 },
  accountLabel: {
    color: AppTheme.textFaint,
    fontSize: 11,
    fontFamily: FontFamily.medium,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  accountAmount: {
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.3,
  },
  topUpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: AppTheme.composer,
    flexShrink: 0,
  },
  topUpLinkText: {
    color: AppTheme.accent,
    fontSize: 12,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.1,
  },
  amountBlock: {
    alignItems: 'stretch',
    gap: 14,
    paddingTop: 52,
  },
  amountHead: {
    alignItems: 'center',
    gap: 10,
  },
  amountDisplayEmpty: {
    color: AppTheme.textFaint,
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  limitText: {
    color: AppTheme.textMuted,
    fontSize: 13,
    fontFamily: FontFamily.regular,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chipPressable: {
    flex: 1,
  },
  chip: {
    height: QUICK_CHIP_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  chipText: {
    fontSize: 13,
    fontFamily: FontFamily.semibold,
  },
  pad: {
    gap: 2,
  },
  padRow: {
    flexDirection: 'row',
  },
  padKey: {
    flex: 1,
    height: ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ROW_RADIUS,
  },
  padKeyPressed: {
    backgroundColor: 'rgba(13,13,13,0.05)',
  },
  padKeyText: {
    color: AppTheme.text,
    fontSize: 26,
    fontFamily: FontFamily.medium,
  },
  footer: {
    paddingHorizontal: AppTheme.edgePadH,
    paddingTop: 12,
  },
  pressed: { opacity: 0.82 },
});
