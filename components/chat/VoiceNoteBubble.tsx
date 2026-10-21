import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';

type Props = {
  uri: string;
  durationMs?: number;
  variant?: 'user' | 'bot';
};

function formatDuration(ms?: number): string {
  const total = Math.max(0, Math.round((ms ?? 0) / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function VoiceNoteBubble({ uri, durationMs, variant = 'user' }: Props) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [loadedDurationMs, setLoadedDurationMs] = useState(durationMs ?? 0);

  const onDark = variant === 'user';
  const shownDuration = formatDuration(loadedDurationMs || durationMs);

  const unload = useCallback(async () => {
    const sound = soundRef.current;
    soundRef.current = null;
    if (!sound) return;
    try {
      await sound.unloadAsync();
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    return () => {
      void unload();
    };
  }, [unload]);

  const togglePlay = async () => {
    if (playing && soundRef.current) {
      await soundRef.current.pauseAsync();
      setPlaying(false);
      return;
    }

    if (!soundRef.current) {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          setPositionMs(status.positionMillis ?? 0);
          if (status.durationMillis != null) setLoadedDurationMs(status.durationMillis);
          if (status.didJustFinish) {
            setPlaying(false);
            setPositionMs(0);
            void sound.setPositionAsync(0);
          }
        },
      );
      soundRef.current = sound;
      setPlaying(true);
      return;
    }

    await soundRef.current.playAsync();
    setPlaying(true);
  };

  const progress =
    loadedDurationMs > 0 ? Math.min(1, positionMs / loadedDurationMs) : 0;

  return (
    <Pressable
      onPress={() => void togglePlay()}
      style={[styles.row, onDark && styles.rowOnDark]}
      accessibilityRole="button"
      accessibilityLabel={playing ? 'Pause voice note' : 'Play voice note'}>
      <View style={[styles.iconWrap, onDark && styles.iconWrapOnDark]}>
        <Ionicons name={playing ? 'pause' : 'play'} size={14} color={onDark ? '#fff' : AppTheme.accent} />
      </View>
      <View style={styles.trackWrap}>
        <View style={[styles.track, onDark && styles.trackOnDark]}>
          <View
            style={[
              styles.fill,
              onDark && styles.fillOnDark,
              { width: `${Math.max(progress * 100, playing ? 8 : 0)}%` },
            ]}
          />
        </View>
      </View>
      <Text style={[styles.duration, onDark && styles.durationOnDark]}>{shownDuration}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 168,
  },
  rowOnDark: {},
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(74, 5, 8, 0.08)',
  },
  iconWrapOnDark: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  trackWrap: {
    flex: 1,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(74, 5, 8, 0.12)',
    overflow: 'hidden',
  },
  trackOnDark: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: AppTheme.accent,
  },
  fillOnDark: {
    backgroundColor: '#fff',
  },
  duration: {
    color: AppTheme.textMuted,
    fontSize: 12,
    fontFamily: FontFamily.medium,
    minWidth: 34,
    textAlign: 'right',
  },
  durationOnDark: {
    color: 'rgba(255,255,255,0.82)',
  },
});
