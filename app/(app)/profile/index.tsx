import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassPressable } from '@/components/ui/GlassPressable';
import { SettingsScreenShell } from '@/components/settings/SettingsDetailScreen';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { AuthRoutes } from '@/constants/AuthRoutes';
import { Copy } from '@/constants/Copy';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { MockHome } from '@/constants/MockData';
import { peopleControlsSummary, restrictionsSummary } from '@/constants/MoneyControls';
import { openPrivacyPolicy, openTermsOfUse } from '@/helpers/support';
import { requireBiometricUnlock } from '@/helpers/localAuth';

const DIVIDER = 'rgba(60,60,67,0.12)';

type RowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  /** Opens outside the app — shows external-link arrow instead of chevron. */
  externalLink?: boolean;
};

function ProfileRow({
  icon,
  label,
  subtitle,
  value,
  onPress,
  destructive,
  showChevron = true,
  externalLink = false,
}: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && onPress && styles.rowPressed]}
      accessibilityRole={onPress ? 'button' : undefined}>
      <View style={styles.rowIconWrap}>
        <Ionicons
          name={icon}
          size={17}
          color={destructive ? AppTheme.accent : AppTheme.text}
        />
      </View>
      <View style={[styles.rowBody, subtitle && styles.rowBodyStacked]}>
        <View style={subtitle ? styles.rowTextStack : styles.rowTextInline}>
          <Text style={[styles.rowLabel, subtitle && styles.rowLabelStacked, destructive && styles.rowLabelDestructive]}>
            {label}
          </Text>
          {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
        </View>
        {value ? (
          <Text style={styles.rowValue} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {showChevron && onPress && !destructive ? (
          externalLink ? (
            <Ionicons name="open-outline" size={16} color="#c7c7cc" />
          ) : (
            <Ionicons name="chevron-forward" size={16} color="#c7c7cc" />
          )
        ) : null}
      </View>
    </Pressable>
  );
}

function ProfileGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.groupWrap}>
      <Text style={styles.groupTitle}>{title}</Text>
      <LiquidGlass style={styles.groupGlass} intensity={50} contentStyle={styles.groupCard}>
        {children}
      </LiquidGlass>
    </View>
  );
}

function RowDivider() {
  return <View style={styles.divider} />;
}

function preferencesSummary(hideBalance: boolean, showBalanceInNaira: boolean): string {
  if (hideBalance) return 'Hidden';
  if (showBalanceInNaira) return 'Naira';
  return 'Dollars';
}

function notificationsSummary(push: boolean, email: boolean): string {
  if (push && email) return 'Push · Email';
  if (push) return 'Push on';
  if (email) return 'Email on';
  return 'Off';
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { preferences, formatAmount } = usePreferences();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const name = user?.name ?? MockHome.userName;
  const email = user?.email ?? 'you@useudara.com';

  const confirmLogout = async () => {
    setLogoutOpen(false);
    await signOut();
    router.replace(AuthRoutes.signIn);
  };

  const openProtectedScreen = async (path: '/(app)/profile/account' | '/(app)/profile/security', reason: string) => {
    const ok = await requireBiometricUnlock(reason);
    if (!ok) return;
    router.push(path);
  };

  return (
    <>
      <SettingsScreenShell
        title="Profile"
        contentStyle={styles.profileScroll}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(app)');
        }}>
        <View style={styles.profile}>
          <View style={styles.avatarWrap}>
            <ProfileAvatar name={name} size="lg" />
          </View>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
        </View>

        <ProfileGroup title="Account">
          <ProfileRow
            icon="person-outline"
            label="Account information"
            onPress={() =>
              void openProtectedScreen(
                '/(app)/profile/account',
                'Confirm it’s you to view account information',
              )
            }
          />
          <RowDivider />
          <ProfileRow
            icon="shield-checkmark-outline"
            label="Security & privacy"
            onPress={() =>
              void openProtectedScreen(
                '/(app)/profile/security',
                'Confirm it’s you to open Security & privacy',
              )
            }
          />
        </ProfileGroup>

        <ProfileGroup title="Settings">
          <ProfileRow
            icon="options-outline"
            label="Preferences"
            value={preferencesSummary(preferences.hideBalance, preferences.showBalanceInNaira)}
            onPress={() => router.push('/(app)/profile/preferences')}
          />
          <RowDivider />
          <ProfileRow
            icon="notifications-outline"
            label="Notifications"
            value={notificationsSummary(
              preferences.pushNotifications,
              preferences.emailNotifications,
            )}
            onPress={() => router.push('/(app)/profile/notifications')}
          />
          <RowDivider />
          <ProfileRow
            icon="headset-outline"
            label="Support"
            onPress={() => router.push('/(app)/profile/support')}
          />
        </ProfileGroup>

        <ProfileGroup title="Money controls">
          <ProfileRow
            icon="people-outline"
            label="Beneficiaries"
            value={peopleControlsSummary()}
            onPress={() => router.push('/(app)/profile/people')}
          />
          <RowDivider />
          <ProfileRow
            icon="shield-outline"
            label="Discipline"
            value={restrictionsSummary(formatAmount)}
            onPress={() => router.push('/(app)/profile/restrictions')}
          />
        </ProfileGroup>

        <ProfileGroup title="Legal">
          <ProfileRow
            icon="document-text-outline"
            label="Terms of Service"
            subtitle="Terms that govern your Udara account"
            externalLink
            onPress={() => void openTermsOfUse()}
          />
          <RowDivider />
          <ProfileRow
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            subtitle="How Udara protects and uses your data"
            externalLink
            onPress={() => void openPrivacyPolicy()}
          />
        </ProfileGroup>

        <View style={styles.logoutWrap}>
          <GlassPressable
            onPress={() => setLogoutOpen(true)}
            variant="destructive"
            size="md"
            fullWidth
            accessibilityLabel="Log out">
            <Ionicons name="log-out-outline" size={20} color="#ffffff" />
            <Text style={styles.logoutLabel}>Log out</Text>
          </GlassPressable>
        </View>
      </SettingsScreenShell>

      <ConfirmDialog
        visible={logoutOpen}
        title={Copy.logout.confirmTitle}
        cancelLabel={Copy.logout.cancel}
        confirmLabel={Copy.logout.confirm}
        destructive
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => void confirmLogout()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  profileScroll: {
    flexGrow: 1,
  },
  profile: {
    alignItems: 'center',
    marginBottom: 22,
    paddingTop: 8,
  },
  avatarWrap: { marginBottom: 12 },
  profileName: {
    color: AppTheme.text,
    fontSize: 24,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.4,
  },
  profileEmail: {
    color: AppTheme.textMuted,
    fontSize: 15,
    fontFamily: FontFamily.regular,
    marginTop: 4,
  },
  groupWrap: { marginBottom: 18 },
  groupTitle: {
    color: AppTheme.textFaint,
    fontSize: 11,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 2,
  },
  groupGlass: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DIVIDER,
  },
  groupCard: {
    overflow: 'hidden',
    paddingVertical: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingLeft: 14,
    paddingRight: 12,
    gap: 10,
  },
  rowPressed: { backgroundColor: 'rgba(0,0,0,0.04)' },
  rowIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(60,60,67,0.07)',
  },
  rowBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: 10,
    gap: 8,
  },
  rowBodyStacked: {
    alignItems: 'center',
  },
  rowTextStack: {
    flex: 1,
    gap: 2,
  },
  rowTextInline: {
    flex: 1,
  },
  rowLabel: {
    flex: 1,
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.regular,
  },
  rowLabelStacked: {
    flex: 0,
    fontFamily: FontFamily.semibold,
  },
  rowSubtitle: {
    color: AppTheme.textMuted,
    fontSize: 12,
    fontFamily: FontFamily.regular,
    lineHeight: 16,
  },
  rowLabelDestructive: { color: AppTheme.accent },
  rowValue: {
    color: AppTheme.textMuted,
    fontSize: 13,
    fontFamily: FontFamily.regular,
    maxWidth: '46%',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
    marginLeft: 58,
  },
  logoutWrap: {
    marginTop: 'auto',
    paddingTop: 28,
  },
  logoutLabel: {
    color: '#ffffff',
    fontSize: 17,
    fontFamily: FontFamily.semibold,
  },
});
