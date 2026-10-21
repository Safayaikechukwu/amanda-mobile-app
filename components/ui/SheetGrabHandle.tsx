import { useMemo, useRef } from 'react';
import { PanResponder, Platform, StyleSheet, View } from 'react-native';

import { AppTheme } from '@/constants/AppTheme';

const DISMISS_DRAG = 72;
const DISMISS_VELOCITY = 0.45;

type Props = {
  onDismiss: () => void;
};

/** Drag down (or tap the grab area) to dismiss a bottom sheet. */
export function SheetGrabHandle({ onDismiss }: Props) {
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) =>
          g.dy > 4 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderRelease: (_, g) => {
          const tapped = Math.abs(g.dy) < 8 && Math.abs(g.dx) < 8;
          if (tapped || g.dy > DISMISS_DRAG || g.vy > DISMISS_VELOCITY) {
            dismissRef.current();
          }
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [],
  );

  return (
    <View
      style={[styles.hitArea, webGrab]}
      {...pan.panHandlers}
      accessibilityRole="button"
      accessibilityLabel="Drag down to close">
      <View style={styles.handle} />
    </View>
  );
}

const webGrab = Platform.OS === 'web' ? ({ cursor: 'grab' } as object) : null;

const styles = StyleSheet.create({
  hitArea: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 6,
    minHeight: 28,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: AppTheme.borderStrong,
  },
});
