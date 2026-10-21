import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CloseIconButton } from '@/components/ui/CloseIconButton';
import { Text } from '@/components/ui/Text';
import { FontFamily } from '@/constants/Fonts';
import { Theme } from '@/constants/Theme';

type Props = {
  onClose?: () => void;
  showBack?: boolean;
};

export function AuthHeader({ onClose, showBack = true }: Props) {
  const router = useRouter();

  return (
    <View style={styles.row}>
      {showBack ? (
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.iconBtn} hitSlop={12}>
          <Text style={styles.icon}>‹</Text>
        </Pressable>
      ) : (
        <View style={styles.iconBtn} />
      )}
      <CloseIconButton
        onPress={onClose ?? (() => router.replace('/(onboarding)/welcome'))}
        variant="plain"
        size={26}
        style={styles.iconBtn}
        hitSlop={12}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.screenX,
    marginBottom: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
    lineHeight: 32,
    color: Theme.color.ink,
    fontFamily: FontFamily.regular,
  },
});
