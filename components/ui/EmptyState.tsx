import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { GlassPressable } from '@/components/ui/GlassPressable';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Softer “you’re good” empties (e.g. nothing to review). */
  tone?: 'default' | 'positive';
};

/**
 * Centered empty state — illustration, headline, supporting line, optional CTA.
 * Pattern matches product empties like “Add items to start a cart”.
 */
export function EmptyState({
  icon,
  title,
  body,
  actionLabel,
  onAction,
  tone = 'default',
}: Props) {
  const accent = tone === 'positive' ? AppTheme.positive : AppTheme.accent;

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <View style={styles.art}>
        <View style={[styles.blob, { backgroundColor: tone === 'positive' ? '#ecfdf5' : '#f8eaea' }]} />
        <View style={[styles.iconWell, { backgroundColor: accent }]}>
          <Ionicons name={icon} size={36} color="#fff" />
        </View>
        <View style={[styles.dot, styles.dotA, { backgroundColor: accent }]} />
        <View style={[styles.dot, styles.dotB, { backgroundColor: AppTheme.positive }]} />
        <View style={[styles.dot, styles.dotC, { backgroundColor: '#d97706' }]} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>

      {actionLabel && onAction ? (
        <GlassPressable
          label={actionLabel}
          onPress={onAction}
          variant="primary"
          size="md"
          fullWidth={false}
          style={styles.cta}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 36,
  },
  art: {
    width: 160,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  blob: {
    position: 'absolute',
    bottom: 8,
    width: 110,
    height: 28,
    borderRadius: 20,
    opacity: 0.9,
  },
  iconWell: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    borderRadius: 99,
  },
  dotA: {
    width: 10,
    height: 10,
    top: 10,
    right: 28,
  },
  dotB: {
    width: 8,
    height: 8,
    top: 28,
    left: 24,
  },
  dotC: {
    width: 12,
    height: 6,
    borderRadius: 4,
    top: 18,
    left: 48,
  },
  title: {
    color: AppTheme.text,
    fontSize: 22,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    color: AppTheme.textMuted,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    maxWidth: 300,
  },
  cta: {
    marginTop: 28,
    minWidth: 180,
    alignSelf: 'center',
  },
});
