import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppScreen } from '@/components/app/AppScreen';
import { BackIconButton } from '@/components/ui/BackIconButton';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import { Toggle } from '@/components/ui/Toggle';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';

const DIVIDER = 'rgba(60,60,67,0.12)';
const ROW_ICON = 34;
const ROW_ICON_INSET = 58; // padding + icon + gap

/** Top inset below safe area on settings screens. */
export const SETTINGS_SCROLL_TOP = 8;

/** Extra offset before the title row — paired with SETTINGS_TITLE_GAP so content stays put. */
export const SETTINGS_TOPBAR_MARGIN_TOP = 4;

/** Space between the title row and page content (old body + scroll top pad). */
export const SETTINGS_TITLE_GAP = 56;

/** Shared scroll + hero spacing for settings-style sub-screens. */
export const SETTINGS_SCROLL_CONTENT = {
  paddingHorizontal: AppTheme.edgePadH,
  paddingTop: SETTINGS_SCROLL_TOP,
  paddingBottom: 32,
} as const;

export const SETTINGS_HERO = {
  alignItems: 'center' as const,
  paddingTop: 0,
  paddingBottom: 14,
  gap: 8,
};

type SettingsTopBarProps = {
  title: string;
  onBack: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Flat back + title row — lives inside scroll content on the page background. */
export function SettingsTopBar({ title, onBack, style }: SettingsTopBarProps) {
  return (
    <View style={[styles.topBar, style]}>
      <BackIconButton onPress={onBack} accessibilityLabel="Back" />
      <Text style={styles.topTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.topSpacer} />
    </View>
  );
}

type SettingsScreenShellProps = {
  title: string;
  onBack: () => void;
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

/** Settings sub-screen — single scroll surface, no separate nav bar box. */
export function SettingsScreenShell({
  title,
  onBack,
  children,
  contentStyle,
}: SettingsScreenShellProps) {
  return (
    <AppScreen>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}>
        <SettingsTopBar title={title} onBack={onBack} />
        {children}
      </ScrollView>
    </AppScreen>
  );
}

type SettingsHeroProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

export function SettingsHeroBlock({ icon, title, description }: SettingsHeroProps) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroIconWrap}>
        <Ionicons name={icon} size={22} color={AppTheme.accent} />
      </View>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroDescription}>{description}</Text>
    </View>
  );
}

type Props = {
  title: string;
  heroIcon: keyof typeof Ionicons.glyphMap;
  heroTitle: string;
  heroDescription: string;
  sectionLabel: string;
  children: ReactNode;
  footer?: ReactNode;
  /** @deprecated All settings screens use compact spacing by default. */
  compact?: boolean;
};

export function SettingsDetailScreen({
  title,
  heroIcon,
  heroTitle,
  heroDescription,
  sectionLabel,
  children,
  footer,
}: Props) {
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/profile');
  };

  return (
    <SettingsScreenShell title={title} onBack={goBack}>
      <SettingsHeroBlock icon={heroIcon} title={heroTitle} description={heroDescription} />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{sectionLabel}</Text>

        <LiquidGlass
          style={styles.cardShell}
          intensity={42}
          contentStyle={styles.card}>
          {children}
        </LiquidGlass>
      </View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SettingsScreenShell>
  );
}

export function SettingsRowDivider({ inset = false }: { compact?: boolean; inset?: boolean }) {
  return <View style={[styles.divider, inset && styles.dividerInset]} />;
}

type ActionRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onPress?: () => void;
  /** @deprecated Uses shared compact row sizing. */
  dense?: boolean;
};

export function SettingsActionRow({
  icon,
  title,
  subtitle,
  actionLabel,
  onPress,
}: ActionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && onPress && styles.rowPressed]}
      accessibilityRole={onPress ? 'button' : undefined}>
      <View style={styles.rowIconWrap}>
        <Ionicons name={icon} size={17} color={AppTheme.accent} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel ? (
        <View style={styles.actionChip}>
          <Text style={styles.actionChipText}>{actionLabel}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

type ToggleRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
};

export function SettingsToggleRow({ icon, title, subtitle, value, onValueChange }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIconWrap}>
        <Ionicons name={icon} size={17} color={AppTheme.accent} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <Toggle value={value} onValueChange={onValueChange} accessibilityLabel={title} />
    </View>
  );
}

export type BalanceCurrency = 'ngn' | 'usd';

const CURRENCY_OPTIONS: { key: BalanceCurrency; label: string }[] = [
  { key: 'ngn', label: '₦ Naira' },
  { key: 'usd', label: '$ Dollars' },
];

const CURRENCY_SLIDE_MS = 360;
const CURRENCY_SLIDE_EASE = Easing.bezier(0.4, 0, 0.2, 1);

type OptionLayout = { x: number; width: number; height: number };

export function SettingsCurrencyPicker({
  value,
  onChange,
}: {
  value: BalanceCurrency;
  onChange: (currency: BalanceCurrency) => void;
}) {
  const layouts = useRef<Partial<Record<BalanceCurrency, OptionLayout>>>({});
  const [measured, setMeasured] = useState(0);
  const activeIndex = Math.max(0, CURRENCY_OPTIONS.findIndex((item) => item.key === value));

  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);
  const indicatorH = useSharedValue(0);
  const progress = useSharedValue(activeIndex);

  useEffect(() => {
    const layout = layouts.current[value];
    if (!layout) return;

    indicatorX.value = withTiming(layout.x, {
      duration: CURRENCY_SLIDE_MS,
      easing: CURRENCY_SLIDE_EASE,
    });
    indicatorW.value = withTiming(layout.width, {
      duration: CURRENCY_SLIDE_MS,
      easing: CURRENCY_SLIDE_EASE,
    });
    indicatorH.value = withTiming(layout.height, {
      duration: CURRENCY_SLIDE_MS,
      easing: CURRENCY_SLIDE_EASE,
    });
    progress.value = withTiming(activeIndex, {
      duration: CURRENCY_SLIDE_MS,
      easing: CURRENCY_SLIDE_EASE,
    });
  }, [activeIndex, measured, value, indicatorH, indicatorW, indicatorX, progress]);

  const onOptionLayout = (key: BalanceCurrency, event: LayoutChangeEvent) => {
    const { x, width, height } = event.nativeEvent.layout;
    const prev = layouts.current[key];
    if (prev && prev.x === x && prev.width === width && prev.height === height) return;

    layouts.current[key] = { x, width, height };
    if (key === value && (!prev || indicatorW.value === 0)) {
      indicatorX.value = x;
      indicatorW.value = width;
      indicatorH.value = height;
    }
    setMeasured((count) => count + 1);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorW.value,
    height: indicatorH.value,
  }));

  return (
    <View style={styles.currencyBlock}>
      <View style={styles.currencyCopy}>
        <Text style={styles.rowTitle}>Display currency</Text>
        <Text style={styles.rowSubtitle}>Show balances in Naira or Dollars</Text>
      </View>
      <View style={styles.currencyPicker}>
        <Animated.View pointerEvents="none" style={[styles.currencyIndicator, indicatorStyle]} />
        {CURRENCY_OPTIONS.map((item, index) => (
          <CurrencyPickerOption
            key={item.key}
            label={item.label}
            index={index}
            progress={progress}
            selected={item.key === value}
            onPress={() => onChange(item.key)}
            onLayout={(event) => onOptionLayout(item.key, event)}
          />
        ))}
      </View>
    </View>
  );
}

function CurrencyPickerOption({
  label,
  index,
  progress,
  selected,
  onPress,
  onLayout,
}: {
  label: string;
  index: number;
  progress: SharedValue<number>;
  selected: boolean;
  onPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
}) {
  const labelStyle = useAnimatedStyle(() => {
    const dist = Math.min(1, Math.abs(progress.value - index));
    return {
      color: interpolateColor(dist, [0, 1], ['#ffffff', AppTheme.textMuted]),
    };
  });

  return (
    <Pressable
      onPress={onPress}
      onLayout={onLayout}
      style={styles.currencyOption}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}>
      <Animated.Text style={[styles.currencyOptionText, labelStyle]}>{label}</Animated.Text>
    </Pressable>
  );
}

export function SettingsInfoRow({
  label,
  value,
  onPress,
  mono,
  layout = 'stacked',
}: {
  label: string;
  value: string;
  onPress?: () => void;
  mono?: boolean;
  layout?: 'inline' | 'stacked';
}) {
  const body =
    layout === 'inline' ? (
      <>
        <Text style={styles.infoRowLabel}>{label}</Text>
        <Text
          style={[styles.infoRowValue, mono && styles.infoRowValueMono]}
          numberOfLines={1}
          ellipsizeMode="middle">
          {value}
        </Text>
        {onPress ? <Ionicons name="copy-outline" size={16} color={AppTheme.textFaint} /> : null}
      </>
    ) : (
      <>
        <View style={styles.infoRowStackedCopy}>
          <Text style={styles.infoRowStackedLabel}>{label}</Text>
          <Text
            style={[styles.infoRowStackedValue, mono && styles.infoRowValueMono]}
            numberOfLines={2}
            ellipsizeMode="middle">
            {value}
          </Text>
        </View>
        {onPress ? <Ionicons name="copy-outline" size={18} color={AppTheme.textFaint} /> : null}
      </>
    );

  const rowStyle = layout === 'inline' ? styles.infoRow : styles.infoRowStacked;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [rowStyle, pressed && styles.rowPressed]}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${value}. Copy.`}>
        {body}
      </Pressable>
    );
  }

  return <View style={rowStyle}>{body}</View>;
}

export function SettingsNote({ children, small }: { children: ReactNode; small?: boolean }) {
  return (
    <View style={[styles.note, small && styles.noteSmall]}>
      <Text style={[styles.noteText, small && styles.noteTextSmall]}>{children}</Text>
    </View>
  );
}

export type SettingsStatusTone = 'success' | 'warning' | 'neutral';

type StatusRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  status: string;
  tone?: SettingsStatusTone;
  /** @deprecated Uses shared compact row sizing. */
  dense?: boolean;
};

const STATUS_TONE_STYLES: Record<
  SettingsStatusTone,
  { bg: string; text: string; dot: string }
> = {
  success: {
    bg: 'rgba(5,150,105,0.1)',
    text: '#047857',
    dot: AppTheme.positive,
  },
  warning: {
    bg: 'rgba(217,119,6,0.12)',
    text: '#B45309',
    dot: '#D97706',
  },
  neutral: {
    bg: AppTheme.composer,
    text: AppTheme.textMuted,
    dot: '#9ca3af',
  },
};

export function SettingsStatusRow({
  icon,
  title,
  subtitle,
  status,
  tone = 'neutral',
}: StatusRowProps) {
  const palette = STATUS_TONE_STYLES[tone];

  return (
    <View style={styles.row}>
      <View style={styles.rowIconWrap}>
        <Ionicons name={icon} size={17} color={AppTheme.accent} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.statusBadge, { backgroundColor: palette.bg }]}>
        <View style={[styles.statusDot, { backgroundColor: palette.dot }]} />
        <Text style={[styles.statusBadgeText, { color: palette.text }]}>{status}</Text>
      </View>
    </View>
  );
}

type StrengthLevel = 'Strong' | 'Good' | 'Fair';

export function SettingsStrengthBanner({ level = 'Strong' }: { level?: StrengthLevel }) {
  const filledBars = level === 'Strong' ? 4 : level === 'Good' ? 3 : 2;

  return (
    <View style={styles.strengthBanner}>
      <View style={styles.strengthCopy}>
        <Text style={styles.strengthLabel}>Account strength</Text>
        <Text style={styles.strengthValue}>{level}</Text>
      </View>
      <View style={styles.strengthBars}>
        {Array.from({ length: 4 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.strengthBar,
              i < filledBars ? styles.strengthBarFilled : styles.strengthBarEmpty,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    ...SETTINGS_SCROLL_CONTENT,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    marginTop: SETTINGS_TOPBAR_MARGIN_TOP,
    marginBottom: SETTINGS_TITLE_GAP,
  },
  topTitle: {
    flex: 1,
    color: AppTheme.text,
    fontSize: 17,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  topSpacer: {
    width: 40,
  },
  hero: {
    ...SETTINGS_HERO,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(60,60,67,0.07)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(60,60,67,0.1)',
    marginBottom: 2,
  },
  heroTitle: {
    color: AppTheme.text,
    fontSize: 22,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.35,
    textAlign: 'center',
    lineHeight: 27,
  },
  heroDescription: {
    color: AppTheme.textMuted,
    fontSize: 14,
    fontFamily: FontFamily.regular,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 280,
    paddingHorizontal: 4,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    color: AppTheme.textFaint,
    fontSize: 11,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginLeft: 2,
  },
  cardShell: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DIVIDER,
  },
  card: {
    overflow: 'hidden',
    paddingVertical: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
    minHeight: 52,
  },
  rowPressed: { backgroundColor: 'rgba(0,0,0,0.04)' },
  rowIconWrap: {
    width: ROW_ICON,
    height: ROW_ICON,
    borderRadius: ROW_ICON / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(60,60,67,0.07)',
  },
  rowCopy: { flex: 1, gap: 2, paddingRight: 4 },
  rowTitle: {
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.semibold,
    lineHeight: 20,
  },
  rowSubtitle: {
    color: AppTheme.textMuted,
    fontSize: 12,
    fontFamily: FontFamily.regular,
    lineHeight: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    minHeight: 44,
    gap: 10,
  },
  infoRowStacked: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  infoRowStackedCopy: {
    flex: 1,
    gap: 4,
  },
  infoRowStackedLabel: {
    color: AppTheme.textMuted,
    fontSize: 12,
    fontFamily: FontFamily.regular,
    lineHeight: 16,
  },
  infoRowStackedValue: {
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.semibold,
    lineHeight: 20,
  },
  infoRowLabel: {
    color: AppTheme.textMuted,
    fontSize: 13,
    fontFamily: FontFamily.regular,
    width: 108,
    flexShrink: 0,
  },
  infoRowValue: {
    flex: 1,
    color: AppTheme.text,
    fontSize: 14,
    fontFamily: FontFamily.medium,
    textAlign: 'right',
  },
  infoRowValueMono: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
  },
  currencyBlock: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  currencyCopy: {
    gap: 2,
  },
  currencyPicker: {
    flexDirection: 'row',
    backgroundColor: AppTheme.composer,
    borderRadius: 10,
    padding: 3,
    gap: 3,
    position: 'relative',
  },
  currencyIndicator: {
    position: 'absolute',
    left: 0,
    top: 3,
    borderRadius: 8,
    backgroundColor: AppTheme.accent,
  },
  currencyOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 1,
  },
  currencyOptionText: {
    fontSize: 14,
    fontFamily: FontFamily.semibold,
  },
  actionChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: AppTheme.composer,
  },
  actionChipText: {
    color: AppTheme.textMuted,
    fontSize: 12,
    fontFamily: FontFamily.medium,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: FontFamily.semibold,
  },
  strengthBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: 'rgba(5,150,105,0.06)',
  },
  strengthCopy: {
    flex: 1,
    gap: 1,
  },
  strengthLabel: {
    color: AppTheme.textMuted,
    fontSize: 12,
    fontFamily: FontFamily.regular,
  },
  strengthValue: {
    color: '#047857',
    fontSize: 17,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.25,
  },
  strengthBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    paddingBottom: 1,
  },
  strengthBar: {
    width: 6,
    borderRadius: 3,
  },
  strengthBarFilled: {
    height: 22,
    backgroundColor: AppTheme.positive,
  },
  strengthBarEmpty: {
    height: 12,
    backgroundColor: 'rgba(5,150,105,0.18)',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
    marginLeft: ROW_ICON_INSET,
  },
  dividerInset: {
    marginLeft: 14,
  },
  footer: {
    marginTop: 12,
    gap: 12,
  },
  note: {
    backgroundColor: 'rgba(74, 5, 8, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  noteText: {
    color: AppTheme.textMuted,
    fontSize: 13,
    fontFamily: FontFamily.regular,
    lineHeight: 19,
    textAlign: 'center',
  },
  noteSmall: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  noteTextSmall: {
    fontSize: 12,
    lineHeight: 17,
  },
});
