import { Ionicons } from '@expo/vector-icons';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import type { Attachment } from '@/helpers/attachments';

const CARD = 76;
/** Horizontal step between card origins — smaller = more overlap (stacked deck). */
const STEP = 52;

type Props = {
  images: Attachment[];
  onRemove: (id: string) => void;
};

/** iMessage-style overlapping photo cards — swipe horizontally through the stack. */
export function ComposerImageStack({ images, onRemove }: Props) {
  if (images.length === 0) return null;

  const stacked = images.length > 1;

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={stacked ? STEP : CARD}
        snapToAlignment="start"
        contentContainerStyle={[styles.row, stacked && styles.rowStacked]}
        keyboardShouldPersistTaps="handled">
        {images.map((img, index) => (
          <View
            key={img.id}
            style={[
              styles.cardOuter,
              stacked && index > 0 && { marginLeft: -(CARD - STEP) },
              { zIndex: images.length - index },
            ]}>
            <View style={styles.card}>
              <Image source={{ uri: img.uri }} style={styles.image} resizeMode="cover" />
            </View>
            <Pressable
              onPress={() => onRemove(img.id)}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Remove image"
              style={({ pressed }) => [styles.removeBtn, pressed && styles.removeBtnPressed]}>
              <Ionicons name="close" size={13} color="#fff" />
            </Pressable>
          </View>
        ))}
      </ScrollView>
      {stacked ? (
        <View pointerEvents="none" style={styles.countPill}>
          <Text style={styles.countText}>{images.length}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    position: 'relative',
  },
  row: {
    alignItems: 'center',
    paddingTop: 6,
    paddingRight: 8,
    paddingBottom: 2,
  },
  rowStacked: {
    paddingRight: 32,
  },
  cardOuter: {
    width: CARD,
    height: CARD,
    position: 'relative',
  },
  card: {
    width: CARD,
    height: CARD,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(74, 5, 8, 0.08)',
    borderWidth: 2,
    borderColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#0d0d0d',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.14,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
      default: {
        boxShadow: '0 3px 10px rgba(13,13,13,0.12)',
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 13, 13, 0.78)',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#0d0d0d',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  removeBtnPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.94 }],
  },
  countPill: {
    position: 'absolute',
    right: -6,
    bottom: 2,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.accent,
  },
  countText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: FontFamily.bold,
  },
});
