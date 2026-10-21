import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppShell } from '@/context/AppShellContext';
import { AppTheme } from '@/constants/AppTheme';
import { DrawerTokens as T } from '@/constants/DrawerTokens';
import { FontFamily } from '@/constants/Fonts';
import { MockDrawerRecents } from '@/constants/MockData';

type NavItem = {
  label: string;
  href: Href;
  slug: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const PRIMARY: NavItem[] = [
  { label: 'Insights', href: '/(app)/insights', slug: 'insights', icon: 'bar-chart-outline' },
  { label: 'Savings', href: '/(app)/savings', slug: 'savings', icon: 'wallet-outline' },
  { label: 'Support', href: '/(app)/support', slug: 'support', icon: 'help-circle-outline' },
];

function routeSlug(pathname: string) {
  const segment = pathname.split('/').filter(Boolean).pop();
  return segment === '(app)' || segment === 'index' ? 'home' : (segment ?? 'home');
}

function NavRow({
  item,
  active,
  onPress,
}: {
  item: NavItem;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      style={({ pressed }) => [styles.navRow, active && styles.rowActive, pressed && styles.pressed]}>
      <Ionicons name={item.icon} size={T.iconSize} color={AppTheme.text} style={styles.navIcon} />
      <Text style={[styles.navLabel, active && styles.navLabelActive]} numberOfLines={1}>
        {item.label}
      </Text>
    </Pressable>
  );
}

/** ChatGPT drawer — white theme, layout + spacing parity. */
export function SidebarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { closeSidebar } = useAppShell();
  const current = routeSlug(pathname);
  const primaryActive = PRIMARY.some((p) => p.slug === current);

  // Cosmetic loading spinner under Recents (ChatGPT parity)
  const [recentsLoading, setRecentsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setRecentsLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const go = (href: Href) => {
    closeSidebar();
    router.replace(href);
  };

  const goHome = () => {
    closeSidebar();
    router.replace('/(app)');
  };

  return (
    <View style={[styles.panel, { paddingTop: insets.top + 10 }]}>
      <View style={styles.header}>
        <Pressable onPress={goHome} accessibilityRole="button" accessibilityLabel="Home" hitSlop={8}>
          <Text style={styles.brand}>Udara</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.iconCircle, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Search">
          <Ionicons name="search-outline" size={18} color={AppTheme.text} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.navSection}>
          {PRIMARY.map((item) => (
            <NavRow
              key={item.label}
              item={item}
              active={current === item.slug}
              onPress={() => go(item.href)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recents</Text>
        <View style={styles.recentsSection}>
          {MockDrawerRecents.map((item, index) => {
            // Only highlight a recent when no primary route is active (home).
            // Never compete with Savings/Insights/etc.
            const active = !primaryActive && current === 'home' && index === 0;
            return (
              <Pressable
                key={item.id}
                onPress={goHome}
                style={({ pressed }) => [
                  styles.recentRow,
                  active && styles.rowActive,
                  pressed && styles.pressed,
                ]}>
                <Text style={styles.recentLabel} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.unread ? <View style={styles.unreadDot} /> : null}
              </Pressable>
            );
          })}
        </View>

        {recentsLoading ? (
          <View style={styles.spinnerWrap}>
            <ActivityIndicator size="small" color={AppTheme.textFaint} />
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, T.footerPadBottomMin) }]}>
        <Pressable
          onPress={goHome}
          style={({ pressed }) => [styles.homePill, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Home">
          <Ionicons name="create-outline" size={18} color="#ffffff" />
          <Text style={styles.homePillText}>Home</Text>
        </Pressable>

      </View>
    </View>
  );
}

export function useDrawerWidth() {
  const { width } = useWindowDimensions();
  return Math.round(Math.min(width * T.widthRatio, T.widthMax));
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: AppTheme.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: T.headerPadH,
    paddingBottom: T.headerPadBottom,
  },
  brand: {
    color: AppTheme.text,
    fontSize: T.brandSize,
    fontFamily: FontFamily.bold,
    letterSpacing: T.brandTracking,
  },
  iconCircle: {
    width: T.iconWell,
    height: T.iconWell,
    borderRadius: T.iconWell / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.iconWellBg,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: T.listPadH,
    paddingBottom: 8,
  },
  navSection: { gap: 1 },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: T.rowPadV,
    paddingHorizontal: T.rowPadH,
    borderRadius: T.rowRadius,
  },
  rowActive: {
    backgroundColor: T.rowActiveBg,
  },
  navIcon: {
    width: T.iconCol,
    marginRight: T.iconToLabel,
    textAlign: 'center',
  },
  navLabel: {
    color: AppTheme.text,
    fontSize: T.navLabelSize,
    fontFamily: FontFamily.regular,
    letterSpacing: -0.2,
    flex: 1,
  },
  navLabelActive: {
    fontFamily: FontFamily.medium,
  },
  sectionTitle: {
    color: AppTheme.textMuted,
    fontSize: T.sectionTitleSize,
    fontFamily: FontFamily.medium,
    marginTop: T.recentsTitleTop,
    marginBottom: T.recentsTitleBottom,
    // ChatGPT: Recents title lines up with primary *labels* (past icon column)
    paddingLeft: T.rowPadH + T.iconCol + T.iconToLabel,
    paddingRight: T.rowPadH,
  },
  recentsSection: { gap: 1 },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: T.rowPadV,
    // Align text with primary labels
    paddingLeft: T.rowPadH + T.iconCol + T.iconToLabel,
    paddingRight: T.rowPadH,
    borderRadius: T.rowRadius,
  },
  recentLabel: {
    flex: 1,
    color: AppTheme.text,
    fontSize: T.recentLabelSize,
    fontFamily: FontFamily.regular,
    letterSpacing: -0.1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.unreadDot,
    marginLeft: 10,
  },
  spinnerWrap: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: T.footerPadH,
    paddingTop: T.footerPadTop,
  },
  homePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: T.homePillBg,
    paddingHorizontal: T.homePillPadH,
    paddingVertical: T.homePillPadV,
    borderRadius: T.homePillRadius,
    minWidth: 120,
  },
  homePillText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.2,
  },
  pressed: { opacity: 0.75 },
});
