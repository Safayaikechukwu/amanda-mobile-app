import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Image,
  type LayoutRectangle,
  Modal,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { BackIconButton } from '@/components/ui/BackIconButton';
import { GlassPressable } from '@/components/ui/GlassPressable';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import {
  formatDisplayDate,
  nextRenewalFromStart,
  type Cadence,
  type MockSubscription,
} from '@/constants/MockInsights';
import {
  CUSTOM_SUB,
  SUB_CATEGORIES,
  cadenceLabel,
  filterCatalog,
  formatLongDate,
  groupCatalogByCategory,
  type CatalogSub,
  type SubCategory,
} from '@/constants/SubscriptionCatalog';

import { SUBSCRIPTION_LOGOS } from './subscriptionLogos';

type Step = 'pick' | 'detail';
type SubType = 'Recurring' | 'One-time';
type Duration = 'Forever' | '3 months' | '6 months' | '1 year' | '2 years';
type ListKind = 'Personal' | 'Business';
type Notify = 'Off' | 'Same day' | '1 day before' | '3 days before' | '1 week before';
type PayMethod = 'None' | 'Card' | 'Bank transfer' | 'Wallet';

type PickerKey =
  | 'date'
  | 'type'
  | 'cycle'
  | 'duration'
  | 'list'
  | 'category'
  | 'payment'
  | 'notify';

type OptionItem = { value: string; label: string };

const DATE_OPTIONS: OptionItem[] = [
  { value: '2026-08-26', label: '26 Aug 2026' },
  { value: '2026-09-01', label: '1 Sep 2026' },
  { value: '2026-09-08', label: '8 Sep 2026' },
  { value: '2026-09-15', label: '15 Sep 2026' },
  { value: '2026-09-22', label: '22 Sep 2026' },
  { value: '2026-10-01', label: '1 Oct 2026' },
];

const TYPE_OPTIONS: OptionItem[] = [
  { value: 'Recurring', label: 'Recurring' },
  { value: 'One-time', label: 'One-time' },
];

const CYCLE_OPTIONS: OptionItem[] = [
  { value: 'weekly', label: 'Every week' },
  { value: 'monthly', label: 'Every month' },
  { value: 'yearly', label: 'Every year' },
];

const DURATION_OPTIONS: OptionItem[] = [
  { value: 'Forever', label: 'Forever' },
  { value: '3 months', label: '3 months' },
  { value: '6 months', label: '6 months' },
  { value: '1 year', label: '1 year' },
  { value: '2 years', label: '2 years' },
];

const LIST_OPTIONS: OptionItem[] = [
  { value: 'Personal', label: 'Personal' },
  { value: 'Business', label: 'Business' },
];

const CATEGORY_OPTIONS: OptionItem[] = SUB_CATEGORIES.map((c) => ({
  value: c,
  label: c,
}));

const PAY_OPTIONS: OptionItem[] = [
  { value: 'None', label: 'None' },
  { value: 'Card', label: 'Card' },
  { value: 'Bank transfer', label: 'Bank transfer' },
  { value: 'Wallet', label: 'Wallet' },
];

const NOTIFY_OPTIONS: OptionItem[] = [
  { value: 'Off', label: 'Off' },
  { value: 'Same day', label: 'Same day' },
  { value: '1 day before', label: '1 day before' },
  { value: '3 days before', label: '3 days before' },
  { value: '1 week before', label: '1 week before' },
];

const PICKER_META: Record<PickerKey, { title: string; options: OptionItem[] }> = {
  date: { title: 'Payment date', options: DATE_OPTIONS },
  type: { title: 'Type', options: TYPE_OPTIONS },
  cycle: { title: 'Cycle', options: CYCLE_OPTIONS },
  duration: { title: 'Duration', options: DURATION_OPTIONS },
  list: { title: 'List', options: LIST_OPTIONS },
  category: { title: 'Category', options: CATEGORY_OPTIONS },
  payment: { title: 'Payment method', options: PAY_OPTIONS },
  notify: { title: 'Notification', options: NOTIFY_OPTIONS },
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (sub: MockSubscription) => void;
};

function SubLogo({
  logoKey,
  name,
  color,
  size = 40,
}: {
  logoKey: string;
  name: string;
  color: string;
  size?: number;
}) {
  const source = SUBSCRIPTION_LOGOS[logoKey];
  const radius = Math.round(size * 0.28);
  if (source) {
    return (
      <Image
        source={source}
        style={{ width: size, height: size, borderRadius: radius }}
        resizeMode="contain"
      />
    );
  }
  const letter = (name || '?').trim().charAt(0).toUpperCase() || '?';
  return (
    <View
      style={[
        styles.logoMark,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: color,
        },
      ]}>
      <Text style={[styles.logoLetter, { fontSize: size * 0.4 }]}>{letter}</Text>
    </View>
  );
}

function PickerChevron() {
  return (
    <View style={styles.pickerChevrons}>
      <Ionicons name="chevron-up" size={10} color={AppTheme.textFaint} />
      <Ionicons name="chevron-down" size={10} color={AppTheme.textFaint} style={{ marginTop: -4 }} />
    </View>
  );
}

export function AddSubscriptionFlow({ visible, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('pick');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CatalogSub | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('2026-08-26');
  const [subType, setSubType] = useState<SubType>('Recurring');
  const [cadence, setCadence] = useState<Cadence>('monthly');
  const [duration, setDuration] = useState<Duration>('Forever');
  const [category, setCategory] = useState<SubCategory>(CUSTOM_SUB.category);
  const [listKind, setListKind] = useState<ListKind>('Personal');
  const [payMethod, setPayMethod] = useState<PayMethod>('None');
  const [notify, setNotify] = useState<Notify>('1 day before');
  const [picker, setPicker] = useState<{ key: PickerKey; anchor: LayoutRectangle } | null>(
    null,
  );
  const [successName, setSuccessName] = useState<string | null>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  useEffect(() => {
    if (!visible) {
      setStep('pick');
      setQuery('');
      setSelected(null);
      setName('');
      setAmount('');
      setPaymentDate('2026-08-26');
      setSubType('Recurring');
      setCadence('monthly');
      setDuration('Forever');
      setCategory(CUSTOM_SUB.category);
      setListKind('Personal');
      setPayMethod('None');
      setNotify('1 day before');
      setPicker(null);
      setSuccessName(null);
    }
  }, [visible]);

  useEffect(() => {
    if (!successName) return;
    const t = setTimeout(() => {
      setSuccessName(null);
      onClose();
    }, 2200);
    return () => clearTimeout(t);
  }, [successName, onClose]);

  const sections = useMemo(() => {
    const filtered = filterCatalog(query);
    return groupCatalogByCategory(filtered).map((g) => ({
      title: g.category.toUpperCase(),
      data: g.items,
    }));
  }, [query]);

  const openDetail = (item: CatalogSub) => {
    setSelected(item);
    setName(item.name);
    setAmount(item.defaultAmount > 0 ? String(item.defaultAmount) : '');
    setCadence(item.defaultCadence);
    setCategory(item.category);
    setPaymentDate('2026-08-26');
    setSubType('Recurring');
    setDuration('Forever');
    setListKind('Personal');
    setPayMethod('None');
    setNotify('1 day before');
    setPicker(null);
    setStep('detail');
  };

  const openCustom = () => {
    openDetail({ ...CUSTOM_SUB });
  };

  const pickerValue = (key: PickerKey): string => {
    switch (key) {
      case 'date':
        return paymentDate;
      case 'type':
        return subType;
      case 'cycle':
        return cadence;
      case 'duration':
        return duration;
      case 'list':
        return listKind;
      case 'category':
        return category;
      case 'payment':
        return payMethod;
      case 'notify':
        return notify;
    }
  };

  const applyPicker = (key: PickerKey, value: string) => {
    switch (key) {
      case 'date':
        setPaymentDate(value);
        break;
      case 'type':
        setSubType(value as SubType);
        break;
      case 'cycle':
        setCadence(value as Cadence);
        break;
      case 'duration':
        setDuration(value as Duration);
        break;
      case 'list':
        setListKind(value as ListKind);
        break;
      case 'category':
        setCategory(value as SubCategory);
        break;
      case 'payment':
        setPayMethod(value as PayMethod);
        break;
      case 'notify':
        setNotify(value as Notify);
        break;
    }
    setPicker(null);
  };

  const submit = () => {
    const parsed = Math.max(0, Math.round(Number(amount.replace(/,/g, '')) || 0));
    const trimmed = name.trim();
    if (!trimmed || parsed <= 0) return;
    const start = paymentDate;
    const renewal =
      subType === 'One-time'
        ? { display: formatDisplayDate(start), sort: start }
        : nextRenewalFromStart(start, cadence);
    onSave({
      id: `s-${Date.now()}`,
      name: trimmed,
      company: selected?.company && selected.id !== 'custom' ? selected.company : trimmed,
      amount: parsed,
      cadence: subType === 'One-time' ? 'monthly' : cadence,
      startDate: start,
      nextRenewal: renewal.display,
      nextRenewalSort: renewal.sort,
      active: true,
    });
    setPicker(null);
    setSuccessName(trimmed);
  };

  const dismissSuccess = () => {
    setSuccessName(null);
    onClose();
  };

  const canSave = name.trim().length > 0 && Number(amount.replace(/,/g, '')) > 0;
  const activePicker = picker ? PICKER_META[picker.key] : null;
  const openFieldPicker = (key: PickerKey, anchor: LayoutRectangle) => {
    setPicker({ key, anchor });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={successName ? dismissSuccess : onClose}>
      <View style={[styles.root, { paddingTop: insets.top + 4 }]}>
        {successName ? (
          <View style={[styles.successWrap, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={36} color="#fff" />
            </View>
            <Text style={styles.successEyebrow}>Subscription successfully added</Text>
            <Text style={styles.successName}>{successName}</Text>
            <Text style={styles.successBody}>
              {successName} is now on your list. You can track renewals and spend from Subscriptions.
            </Text>
            <GlassPressable
              label="Done"
              onPress={dismissSuccess}
              fullWidth={false}
              style={styles.successBtn}
              accessibilityLabel="Done"
            />
          </View>
        ) : step === 'pick' ? (
          <View style={styles.pickShell}>
            <LinearGradient
              colors={['#ffffff', '#f7f4f5', '#f0e9eb']}
              locations={[0, 0.55, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <View style={styles.nav}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [styles.cancelPill, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Cancel">
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Text style={styles.navTitle}>Add Subscription</Text>
              <View style={styles.navSide} />
            </View>

            <SectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              stickySectionHeadersEnabled={false}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: 100 + insets.bottom },
              ]}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                <Pressable
                  onPress={openCustom}
                  style={({ pressed }) => [styles.customRow, pressed && styles.pressed]}>
                  <View style={[styles.logoMark, styles.customMark]}>
                    <Ionicons name="add" size={22} color="#fff" />
                  </View>
                  <Text style={styles.rowName}>Add custom</Text>
                </Pressable>
              }
              ListEmptyComponent={
                <Text style={styles.empty}>No matches — try Add custom above.</Text>
              }
              renderSectionHeader={({ section }) => (
                <Text style={styles.sectionLabel}>{section.title}</Text>
              )}
              renderItem={({ item, index, section }) => {
                const last = index === section.data.length - 1;
                return (
                  <Pressable
                    onPress={() => openDetail(item)}
                    style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                    <SubLogo logoKey={item.logoKey} name={item.name} color={item.color} />
                    <View style={[styles.rowBody, !last && styles.rowBodyBorder]}>
                      <Text style={styles.rowName}>{item.name}</Text>
                    </View>
                  </Pressable>
                );
              }}
            />

            <View style={[styles.searchWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
              <LiquidGlass style={styles.searchGlass} intensity={70} contentStyle={styles.searchInner}>
                <Ionicons name="search" size={18} color={AppTheme.textMuted} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search"
                  placeholderTextColor={AppTheme.textFaint}
                  style={styles.searchInput}
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                />
              </LiquidGlass>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.nav}>
              <BackIconButton
                onPress={() => setStep('pick')}
                accessibilityLabel="Back"
                variant="solid"
              />
              <Text style={styles.navTitle}>Add Subscription</Text>
              <GlassPressable
                label="Save"
                onPress={submit}
                disabled={!canSave}
                size="sm"
                fullWidth={false}
                style={styles.savePill}
                accessibilityLabel="Save"
              />
            </View>

            <View style={styles.detailShell}>
              <LinearGradient
                colors={['#f7f5f4', '#ffffff', '#f3eef0']}
                locations={[0, 0.45, 1]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              <ScrollView
                contentContainerStyle={[
                  styles.detailContent,
                  { paddingBottom: insets.bottom + 32 },
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
              <LiquidGlass style={styles.groupGlass} intensity={48} contentStyle={styles.groupInner}>
                <View style={styles.identityRow}>
                  <SubLogo
                    logoKey={selected?.logoKey ?? 'custom'}
                    name={name || selected?.name || '?'}
                    color={selected?.color ?? AppTheme.accent}
                    size={52}
                  />
                  <View style={styles.identityCopy}>
                    {selected?.id === 'custom' ? (
                      <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Subscription name"
                        placeholderTextColor={AppTheme.textFaint}
                        style={styles.nameInput}
                      />
                    ) : (
                      <Text style={styles.identityName} numberOfLines={2}>
                        {name}
                      </Text>
                    )}
                    <View style={styles.amountField}>
                      <View style={styles.nairaBadge}>
                        <Text style={styles.nairaBadgeText}>₦</Text>
                      </View>
                      <TextInput
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        placeholderTextColor={AppTheme.textFaint}
                        keyboardType="number-pad"
                        style={styles.amountInput}
                      />
                    </View>
                  </View>
                </View>
              </LiquidGlass>

              <LiquidGlass style={styles.groupGlass} intensity={48} contentStyle={styles.groupInner}>
                <FieldRow
                  label="Payment date"
                  onOpen={(anchor) => openFieldPicker('date', anchor)}
                  right={
                    <View style={styles.valuePill}>
                      <Text style={styles.valuePillText}>{formatLongDate(paymentDate)}</Text>
                    </View>
                  }
                />
                <FieldRow
                  label="Type"
                  onOpen={(anchor) => openFieldPicker('type', anchor)}
                  right={
                    <View style={styles.valueWithIcon}>
                      <Text style={styles.valueText}>{subType}</Text>
                      <PickerChevron />
                    </View>
                  }
                />
                {subType === 'Recurring' ? (
                  <FieldRow
                    label="Cycle"
                    onOpen={(anchor) => openFieldPicker('cycle', anchor)}
                    right={
                      <View style={styles.valueWithIcon}>
                        <Text style={styles.valueText}>{cadenceLabel(cadence)}</Text>
                        <PickerChevron />
                      </View>
                    }
                  />
                ) : null}
                <FieldRow
                  label="Duration"
                  last
                  onOpen={(anchor) => openFieldPicker('duration', anchor)}
                  right={
                    <View style={styles.valueWithIcon}>
                      <Text style={styles.valueText}>{duration}</Text>
                      <PickerChevron />
                    </View>
                  }
                />
              </LiquidGlass>

              <LiquidGlass style={styles.groupGlass} intensity={48} contentStyle={styles.groupInner}>
                <FieldRow
                  label="List"
                  onOpen={(anchor) => openFieldPicker('list', anchor)}
                  right={
                    <View style={styles.valueWithIcon}>
                      <Text style={styles.valueText}>{listKind}</Text>
                      <PickerChevron />
                    </View>
                  }
                />
                <FieldRow
                  label="Category"
                  onOpen={(anchor) => openFieldPicker('category', anchor)}
                  right={
                    <View style={styles.valueWithIcon}>
                      <Text style={styles.valueText}>{category}</Text>
                      <PickerChevron />
                    </View>
                  }
                />
                <FieldRow
                  label="Payment Method"
                  last
                  onOpen={(anchor) => openFieldPicker('payment', anchor)}
                  right={
                    <View style={styles.valueWithIcon}>
                      <Text style={payMethod === 'None' ? styles.valueMuted : styles.valueText}>
                        {payMethod}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={AppTheme.textFaint} />
                    </View>
                  }
                />
              </LiquidGlass>

              <LiquidGlass style={styles.groupGlass} intensity={48} contentStyle={styles.groupInner}>
                <FieldRow
                  label="Notification"
                  last
                  onOpen={(anchor) => openFieldPicker('notify', anchor)}
                  right={
                    <View style={styles.valueWithIcon}>
                      <Text style={styles.valueText}>{notify}</Text>
                      <PickerChevron />
                    </View>
                  }
                />
              </LiquidGlass>

              <Text style={styles.hint}>
                {subType === 'One-time'
                  ? `Charges once on ${formatLongDate(paymentDate)}`
                  : `Next charge ≈ ${formatDisplayDate(nextRenewalFromStart(paymentDate, cadence).sort)}`}
                {duration !== 'Forever' ? ` · ${duration}` : ''}
              </Text>
              </ScrollView>
            </View>
          </>
        )}

        {activePicker && picker ? (
          <OptionPopup
            title={activePicker.title}
            options={activePicker.options}
            value={pickerValue(picker.key)}
            anchor={picker.anchor}
            windowWidth={windowWidth}
            windowHeight={windowHeight}
            onSelect={(value) => applyPicker(picker.key, value)}
            onClose={() => setPicker(null)}
          />
        ) : null}
      </View>
    </Modal>
  );
}

function OptionPopup({
  title,
  options,
  value,
  anchor,
  windowWidth,
  windowHeight,
  onSelect,
  onClose,
}: {
  title: string;
  options: OptionItem[];
  value: string;
  anchor: LayoutRectangle;
  windowWidth: number;
  windowHeight: number;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const POPUP_W = Math.min(248, windowWidth - 24);
  const estimatedH = Math.min(52 + options.length * 48, windowHeight * 0.55);
  const gap = 8;
  let top = anchor.y + anchor.height + gap;
  let left = anchor.x + anchor.width - POPUP_W;
  left = Math.max(12, Math.min(left, windowWidth - POPUP_W - 12));
  if (top + estimatedH > windowHeight - 20) {
    top = Math.max(12, anchor.y - estimatedH - gap);
  }

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View style={styles.popupLayer} pointerEvents="box-none">
        <Pressable style={styles.popupScrim} onPress={onClose} accessibilityLabel="Dismiss" />
        <View
          style={[styles.popupAnchor, { top, left, width: POPUP_W, maxHeight: estimatedH }]}
          accessibilityRole="menu">
          <LiquidGlass style={styles.popupGlass} intensity={80} contentStyle={styles.popupInner}>
            <Text style={styles.popupTitle}>{title}</Text>
            <ScrollView
              style={styles.popupList}
              bounces={options.length > 6}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {options.map((opt, i) => {
                const selected = opt.value === value;
                const last = i === options.length - 1;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => onSelect(opt.value)}
                    style={({ pressed }) => [
                      styles.popupRow,
                      !last && styles.popupRowBorder,
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected }}>
                    <Text style={[styles.popupRowLabel, selected && styles.popupRowLabelActive]}>
                      {opt.label}
                    </Text>
                    {selected ? (
                      <Ionicons name="checkmark" size={18} color={AppTheme.accent} />
                    ) : (
                      <View style={styles.popupCheckSpacer} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </LiquidGlass>
        </View>
      </View>
    </Modal>
  );
}

function FieldRow({
  label,
  right,
  onOpen,
  last,
}: {
  label: string;
  right: ReactNode;
  onOpen?: (anchor: LayoutRectangle) => void;
  last?: boolean;
}) {
  const ref = useRef<View>(null);
  const content = (
    <View ref={ref} collapsable={false} style={[styles.fieldRow, !last && styles.fieldRowBorder]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {right}
    </View>
  );
  if (onOpen) {
    return (
      <Pressable
        onPress={() => {
          ref.current?.measureInWindow((x, y, width, height) => {
            onOpen({ x, y, width, height });
          });
        }}
        style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppTheme.bg,
  },
  pickShell: {
    flex: 1,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
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
  navSide: { width: 72 },
  cancelPill: {
    minWidth: 72,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: AppTheme.track,
    alignItems: 'center',
  },
  cancelText: {
    color: AppTheme.accent,
    fontSize: 15,
    fontFamily: FontFamily.medium,
  },
  savePill: {
    minWidth: 64,
  },
  pressed: { opacity: 0.75 },
  listContent: {
    paddingTop: 4,
  },
  sectionLabel: {
    color: AppTheme.textFaint,
    fontSize: 12,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    gap: 14,
  },
  rowBody: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 20,
    justifyContent: 'center',
  },
  rowBodyBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppTheme.border,
  },
  rowName: {
    color: AppTheme.text,
    fontSize: 16,
    fontFamily: FontFamily.regular,
  },
  logoMark: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoLetter: {
    color: '#fff',
    fontFamily: FontFamily.bold,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  customMark: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: AppTheme.accent,
  },
  empty: {
    color: AppTheme.textMuted,
    fontSize: 14,
    fontFamily: FontFamily.regular,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  searchWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  searchGlass: {
    borderRadius: 26,
    boxShadow: '0 8px 28px rgba(74,5,8,0.12)',
    elevation: 8,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FontFamily.regular,
    color: AppTheme.text,
    padding: 0,
  },
  detailShell: {
    flex: 1,
  },
  detailContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },
  groupGlass: {
    borderRadius: 18,
    boxShadow: '0 6px 20px rgba(13,13,13,0.06)',
    elevation: 3,
  },
  groupInner: {
    overflow: 'hidden',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  identityCopy: {
    flex: 1,
    gap: 8,
  },
  identityName: {
    color: AppTheme.text,
    fontSize: 17,
    fontFamily: FontFamily.semibold,
  },
  nameInput: {
    color: AppTheme.text,
    fontSize: 17,
    fontFamily: FontFamily.semibold,
    padding: 0,
  },
  amountField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: AppTheme.composer,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppTheme.border,
  },
  nairaBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: AppTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valuePill: {
    backgroundColor: AppTheme.composer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppTheme.border,
  },
  nairaBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: FontFamily.bold,
  },
  amountInput: {
    minWidth: 72,
    fontSize: 16,
    fontFamily: FontFamily.medium,
    color: AppTheme.text,
    padding: 0,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  fieldRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(13,13,13,0.08)',
  },
  fieldLabel: {
    color: AppTheme.text,
    fontSize: 16,
    fontFamily: FontFamily.regular,
  },
  valuePillText: {
    color: AppTheme.text,
    fontSize: 14,
    fontFamily: FontFamily.medium,
  },
  valueWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valueText: {
    color: AppTheme.textMuted,
    fontSize: 15,
    fontFamily: FontFamily.regular,
  },
  valueMuted: {
    color: AppTheme.textFaint,
    fontSize: 15,
    fontFamily: FontFamily.regular,
  },
  pickerChevrons: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    color: AppTheme.textMuted,
    fontSize: 13,
    fontFamily: FontFamily.regular,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  popupLayer: {
    flex: 1,
  },
  popupScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(13,13,13,0.18)',
  },
  popupAnchor: {
    position: 'absolute',
    zIndex: 2,
  },
  popupGlass: {
    borderRadius: 22,
    boxShadow: '0 16px 48px rgba(0,0,0,0.22)',
    elevation: 16,
  },
  popupInner: {
    paddingTop: 12,
    paddingBottom: 6,
  },
  popupTitle: {
    color: AppTheme.textMuted,
    fontSize: 13,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.2,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  popupList: {
    maxHeight: 320,
  },
  popupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    minHeight: 46,
  },
  popupRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(13,13,13,0.08)',
  },
  popupRowLabel: {
    flex: 1,
    color: AppTheme.text,
    fontSize: 16,
    fontFamily: FontFamily.regular,
  },
  popupRowLabelActive: {
    color: AppTheme.accent,
    fontFamily: FontFamily.semibold,
  },
  popupCheckSpacer: {
    width: 18,
  },
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: AppTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successEyebrow: {
    color: AppTheme.textMuted,
    fontSize: 14,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  successName: {
    color: AppTheme.text,
    fontSize: 28,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  successBody: {
    color: AppTheme.textMuted,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  successBtn: {
    marginTop: 8,
    minWidth: 140,
    alignSelf: 'center',
  },
});
