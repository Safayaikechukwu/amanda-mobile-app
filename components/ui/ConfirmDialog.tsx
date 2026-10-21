import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassPressable } from '@/components/ui/GlassPressable';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  cancelLabel?: string;
  confirmLabel: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  cancelLabel = 'Cancel',
  confirmLabel,
  destructive = false,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <GlassPressable
              label={cancelLabel}
              onPress={onCancel}
              variant="secondary"
              size="md"
              fullWidth
              style={styles.action}
            />
            <GlassPressable
              label={confirmLabel}
              onPress={onConfirm}
              variant={destructive ? 'destructive' : 'primary'}
              size="md"
              fullWidth
              style={styles.action}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(13,13,13,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: AppTheme.bg,
    borderRadius: 20,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 16,
    boxShadow: '0 12px 40px rgba(13,13,13,0.18)',
    elevation: 8,
  },
  title: {
    color: AppTheme.text,
    fontSize: 17,
    lineHeight: 24,
    fontFamily: FontFamily.semibold,
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    color: AppTheme.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    marginTop: -10,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  action: {
    flex: 1,
  },
});
