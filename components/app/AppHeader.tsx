import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { useAppShell } from '@/context/AppShellContext';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';

type Props = {
  title?: string;
  onSupportPress?: () => void;
  showSupport?: boolean;
};

type IconButtonProps = {
  accessibilityLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

function HeaderIconButton({ accessibilityLabel, icon, onPress }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}>
      <Ionicons name={icon} size={20} color={AppTheme.text} />
    </Pressable>
  );
}

function HeaderIconPlaceholder() {
  return <View style={styles.iconBtnPlaceholder} />;
}

export function AppHeader({ title, onSupportPress, showSupport = true }: Props) {
  const insets = useSafeAreaInsets();
  const { openSidebar } = useAppShell();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 6 }]}>
      <HeaderIconButton accessibilityLabel="Open menu" icon="menu" onPress={openSidebar} />

      {title ? (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View style={styles.titleSpacer} />
      )}

      {showSupport ? (
        <HeaderIconButton
          accessibilityLabel="Support"
          icon="help-circle-outline"
          onPress={onSupportPress}
        />
      ) : (
        <HeaderIconPlaceholder />
      )}
    </View>
  );
}

const ICON_SIZE = 36;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: AppTheme.bg,
  },
  iconBtn: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.track,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  iconBtnPressed: {
    opacity: 0.72,
  },
  iconBtnPlaceholder: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: AppTheme.text,
    fontSize: 17,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.2,
    paddingHorizontal: 12,
  },
  titleSpacer: {
    flex: 1,
  },
});
