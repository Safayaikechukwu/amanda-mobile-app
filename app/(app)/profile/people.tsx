import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppScreen } from '@/components/app/AppScreen';
import {
  SettingsHeroBlock,
  SettingsRowDivider,
  SettingsTopBar,
} from '@/components/settings/SettingsDetailScreen';
import { GlassPressable } from '@/components/ui/GlassPressable';
import { EmptyState } from '@/components/ui/EmptyState';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { Text } from '@/components/ui/Text';
import {
  formatBlockedDate,
  formatPersonAccount,
  MockLinkedAccounts,
  type ManagedPerson,
} from '@/constants/MoneyControls';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { usePreferences } from '@/context/PreferencesContext';
import { hapticLight } from '@/helpers/haptics';
import { openUdaraChat } from '@/helpers/openUdaraChat';
import {
  queryBeneficiaries,
  type BeneficiaryFilter,
} from '@/helpers/beneficiariesCatalog';

const PAGE_SIZE = 40;

const FILTERS: { key: BeneficiaryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'limits', label: 'Limits' },
  { key: 'recurring', label: 'Recurring' },
];

function openChat(router: ReturnType<typeof useRouter>, message: string) {
  openUdaraChat(router, message, { focusComposer: true });
}

function emptyStateFor(
  filter: BeneficiaryFilter,
  query: string,
  router: ReturnType<typeof useRouter>,
): ComponentProps<typeof EmptyState> {
  const trimmed = query.trim();
  if (trimmed) {
    return {
      icon: 'search-outline',
      title: 'No matches',
      body: `Nothing matched “${trimmed}”. Try another name, bank, or account number.`,
    };
  }

  switch (filter) {
    case 'blocked':
      return {
        icon: 'shield-checkmark-outline',
        title: 'No one blocked',
        body: 'No one is blocked from sending you money.',
        tone: 'positive',
      };
    case 'limits':
      return {
        icon: 'speedometer-outline',
        title: 'No spend limits',
        body: 'You haven’t capped how much you can send to anyone yet.',
        actionLabel: 'Set a limit',
        onAction: () => openChat(router, 'I want to set a spending limit for someone'),
      };
    case 'recurring':
      return {
        icon: 'repeat-outline',
        title: 'No recurring payments',
        body: 'Standing orders and autopay will show up here.',
        actionLabel: 'Set up recurring',
        onAction: () => openChat(router, 'I want to set up a recurring payment'),
      };
    case 'all':
    default:
      return {
        icon: 'people-outline',
        title: 'No saved people yet',
        body: 'Everyone you pay will live here — search, filter, and manage them in one place.',
        actionLabel: 'Add someone',
        onAction: () => openChat(router, 'I want to add a new beneficiary'),
      };
  }
}

function rowSubtitle(
  person: ManagedPerson,
  formatAmount: (n: number) => string,
): string {
  const account = formatPersonAccount(person);
  if (person.blocked) {
    const when = person.blockedAt
      ? `Blocked ${formatBlockedDate(person.blockedAt)}`
      : 'Blocked';
    return `${when} · ${account}`;
  }
  if (person.recurringAmount != null) {
    return `${formatAmount(person.recurringAmount)} ${person.recurringCadence ?? 'monthly'} · ${account}`;
  }
  if (person.limit != null) {
    return `Cap ${formatAmount(person.limit)} · ${account}`;
  }
  if ((person.sendCount ?? 0) > 0) {
    return `${person.sendCount} sends · ${formatAmount(person.totalSent ?? 0)} · ${account}`;
  }
  return account;
}

function rowAction(
  person: ManagedPerson,
  formatAmount: (n: number) => string,
): { label: string; message: string; destructive?: boolean } | null {
  if (person.blocked) {
    return {
      label: 'Unblock',
      message: `Unblock ${person.name} from sending me money`,
      destructive: true,
    };
  }
  if (person.limit != null) {
    return {
      label: 'Change',
      message: `Change the spending limit for ${person.name} — currently ${formatAmount(person.limit)}`,
    };
  }
  if (person.recurringAmount != null) {
    return {
      label: 'Change',
      message: `Change the recurring payment to ${person.name} — currently ${formatAmount(person.recurringAmount)} ${person.recurringCadence ?? 'monthly'}`,
    };
  }
  return null;
}

function BeneficiaryActionButton({
  label,
  destructive,
  onPress,
}: {
  label: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  return (
    <GlassPressable
      label={label}
      onPress={() => {
        hapticLight();
        onPress();
      }}
      variant={destructive ? 'destructive' : 'ghost'}
      size="sm"
      fullWidth={false}
      style={styles.rowActionBtn}
    />
  );
}

export default function BeneficiariesScreen() {
  const router = useRouter();
  const { formatAmount } = usePreferences();

  const [filter, setFilter] = useState<BeneficiaryFilter>('all');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<ManagedPerson[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPage = useCallback(
    (offset: number, reset: boolean) => {
      const result = queryBeneficiaries({
        filter,
        query,
        offset,
        limit: PAGE_SIZE,
      });
      setTotal(result.total);
      setHasMore(result.hasMore);
      setItems((prev) => (reset ? result.items : [...prev, ...result.items]));
    },
    [filter, query],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setItems([]);
    const timer = setTimeout(() => {
      if (!cancelled) loadPage(0, true);
      if (!cancelled) setLoading(false);
    }, query.trim() ? 200 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filter, query, loadPage]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    loadPage(items.length, false);
    setLoadingMore(false);
  }, [hasMore, items.length, loadPage, loading, loadingMore]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/profile');
  };

  const countLabel = useMemo(() => {
    if (total === 0) return null;
    if (query.trim()) {
      return `${total} match${total === 1 ? '' : 'es'}`;
    }
    return `${total} ${total === 1 ? 'person' : 'people'}`;
  }, [query, total]);

  const emptyProps = useMemo(
    () => emptyStateFor(filter, query, router),
    [filter, query, router],
  );

  const renderItem = ({ item }: { item: ManagedPerson }) => {
    const action = rowAction(item, formatAmount);
    return (
      <View style={styles.row}>
        <View style={styles.rowMain}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            {action ? (
              <BeneficiaryActionButton
                label={action.label}
                destructive={action.destructive}
                onPress={() => openChat(router, action.message)}
              />
            ) : null}
          </View>
          <Text style={styles.subtitle} numberOfLines={1}>
            {rowSubtitle(item, formatAmount)}
          </Text>
        </View>
      </View>
    );
  };

  const header = (
    <View style={styles.header}>
      <SettingsTopBar title="Beneficiaries" onBack={goBack} />

      <SettingsHeroBlock
        icon="people-outline"
        title="Who you pay."
        description="Everyone you send money to — blocked, capped, or on autopay."
      />

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={AppTheme.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search"
          placeholderTextColor={AppTheme.textFaint}
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.filters}>
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              style={[styles.chip, active && styles.chipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {countLabel ? <Text style={styles.count}>{countLabel}</Text> : null}
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      {loadingMore ? <ActivityIndicator color={AppTheme.accent} style={styles.loader} /> : null}
      {!loading && !hasMore && items.length > 0 ? (
        <Text style={styles.end}>That’s everyone</Text>
      ) : null}

      <View style={styles.linkedSection}>
        <Text style={styles.linkedLabel}>Linked accounts</Text>
        <LiquidGlass style={styles.linkedCard} intensity={42} contentStyle={styles.linkedCardInner}>
          {MockLinkedAccounts.map((account, index) => (
            <View key={account.id}>
              {index > 0 ? <SettingsRowDivider inset /> : null}
              <View style={styles.linkedRow}>
                <Ionicons name="wallet-outline" size={16} color={AppTheme.accent} />
                <View style={styles.linkedCopy}>
                  <Text style={styles.linkedName}>{account.label}</Text>
                  <Text style={styles.linkedMeta}>{`${account.bank} · ·${account.last4}`}</Text>
                </View>
              </View>
            </View>
          ))}
        </LiquidGlass>
      </View>

      <GlassPressable
        label="Add someone"
        onPress={() => openChat(router, 'I want to add a new beneficiary')}
        variant="secondary"
        size="md"
        fullWidth
      />
    </View>
  );

  return (
    <AppScreen>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={AppTheme.accent} style={styles.loader} />
          ) : (
            <EmptyState {...emptyProps} />
          )
        }
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: AppTheme.edgePadH,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 6,
    gap: 8,
    marginBottom: 2,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(60,60,67,0.08)',
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  searchInput: {
    flex: 1,
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.regular,
    padding: 0,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(60,60,67,0.08)',
  },
  chipActive: {
    backgroundColor: AppTheme.accent,
  },
  chipText: {
    color: AppTheme.textMuted,
    fontSize: 13,
    fontFamily: FontFamily.medium,
  },
  chipTextActive: {
    color: '#fff',
  },
  count: {
    color: AppTheme.textFaint,
    fontSize: 12,
    fontFamily: FontFamily.regular,
  },
  row: {
    paddingVertical: 8,
  },
  rowMain: { flex: 1, gap: 2 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowActionBtn: {
    flexShrink: 0,
  },
  name: {
    flex: 1,
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.15,
  },
  subtitle: {
    color: AppTheme.textMuted,
    fontSize: 12,
    fontFamily: FontFamily.regular,
    lineHeight: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60,60,67,0.12)',
  },
  footer: {
    gap: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  loader: { marginVertical: 12 },
  end: {
    color: AppTheme.textFaint,
    fontSize: 12,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
  },
  linkedSection: { gap: 8, marginTop: 8 },
  linkedLabel: {
    color: AppTheme.textFaint,
    fontSize: 11,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginLeft: 2,
  },
  linkedCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(60,60,67,0.12)',
  },
  linkedCardInner: { overflow: 'hidden', paddingVertical: 2 },
  linkedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  linkedCopy: { flex: 1, gap: 2 },
  linkedName: {
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.semibold,
  },
  linkedMeta: {
    color: AppTheme.textMuted,
    fontSize: 13,
    fontFamily: FontFamily.regular,
  },
});
