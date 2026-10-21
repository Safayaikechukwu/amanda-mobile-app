import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

export type InsightsTabPagerHandle = {
  goToPage: (index: number, animated?: boolean) => void;
};

type Props = {
  width: number;
  height: number;
  onProgressChange: (progress: number) => void;
  onPageSettled: (index: number) => void;
  children: ReactNode[];
};

const webPanX = Platform.OS === 'web' ? ({ touchAction: 'pan-x' } as object) : null;

/** Cross-platform horizontal pager — ScrollView only (safe for web + SSR). */
export const InsightsTabPager = forwardRef<InsightsTabPagerHandle, Props>(
  function InsightsTabPager({ width, height, onProgressChange, onPageSettled, children }, ref) {
    const scrollRef = useRef<ScrollView>(null);

    useImperativeHandle(ref, () => ({
      goToPage(index: number, animated = true) {
        scrollRef.current?.scrollTo({ x: index * width, animated });
      },
    }));

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (width <= 0) return;
      onProgressChange(e.nativeEvent.contentOffset.x / width);
    };

    const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (width <= 0) return;
      const page = Math.max(
        0,
        Math.min(children.length - 1, Math.round(e.nativeEvent.contentOffset.x / width)),
      );
      onProgressChange(page);
      onPageSettled(page);
    };

    return (
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollEndDrag={onScrollEnd}
        onMomentumScrollEnd={onScrollEnd}
        decelerationRate="normal"
        bounces={false}
        nestedScrollEnabled
        style={[styles.pager, webPanX]}
        keyboardShouldPersistTaps="handled">
        {children.map((child, index) => (
          <View
            key={index}
            style={{ width, flex: height > 0 ? undefined : 1, height: height > 0 ? height : undefined }}>
            {child}
          </View>
        ))}
      </ScrollView>
    );
  },
);

const styles = StyleSheet.create({
  pager: { flex: 1 },
});
