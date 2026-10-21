import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, View } from 'react-native';

import {
  CX,
  CY,
  DIAL,
  DialFaceLabels,
  DialSvg,
  EndpointHeader,
  TRACK_R,
  TRACK_STROKE,
} from '@/components/discipline/SpendingWindowDial';
import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { hapticLight, hapticMedium, hapticSelection, hapticWarning } from '@/helpers/haptics';
import {
  SPENDING_WINDOW_BOUNDS,
  angleFromCenter,
  clampWindowHandle,
  clockDegreesToMinutes,
  formatWindowDurationShort,
  formatWindowTimeHeader,
  isMinuteInWindow,
  minutesToClockDegrees,
  polarPoint,
  shiftWindowBlock,
} from '@/helpers/spendingWindow';

const ACCENT = AppTheme.accent;
const HANDLE_HIT = 44;
const HANDLE_SIZE = 34;

type Props = {
  startMinutes: number;
  endMinutes: number;
  onRequestConfirm: (startMinutes: number, endMinutes: number) => void;
};

type DragMode = 'start' | 'end' | 'shift';

function ScheduleHandle({
  kind,
  minutes,
  active,
}: {
  kind: 'start' | 'end';
  minutes: number;
  active: boolean;
}) {
  const point = polarPoint(CX, CY, TRACK_R, minutesToClockDegrees(minutes));
  const icon = kind === 'start' ? 'alarm' : 'bed';
  const size = active ? HANDLE_SIZE + 2 : HANDLE_SIZE;

  return (
    <View
      style={[
        styles.handleHit,
        { left: point.x - HANDLE_HIT / 2, top: point.y - HANDLE_HIT / 2 },
      ]}
      pointerEvents="none">
      <View style={[styles.handleCircle, { width: size, height: size, borderRadius: size / 2 }]}>
        <Ionicons name={icon} size={15} color="#48484a" />
      </View>
    </View>
  );
}

export function SpendingWindowCard({ startMinutes, endMinutes, onRequestConfirm }: Props) {
  const [editing, setEditing] = useState(false);
  const [draftStart, setDraftStart] = useState(startMinutes);
  const [draftEnd, setDraftEnd] = useState(endMinutes);
  const [activeMode, setActiveMode] = useState<DragMode | null>(null);

  const dragModeRef = useRef<DragMode | null>(null);
  const shiftOriginRef = useRef<{ start: number; end: number; angle: number } | null>(null);
  const atLimitRef = useRef(false);

  const displayStart = editing ? draftStart : startMinutes;
  const displayEnd = editing ? draftEnd : endMinutes;
  const hasDraftChange = editing && (draftStart !== startMinutes || draftEnd !== endMinutes);
  const durationLabel = formatWindowDurationShort(displayStart, displayEnd);

  useEffect(() => {
    setDraftStart(startMinutes);
    setDraftEnd(endMinutes);
    setEditing(false);
    setActiveMode(null);
  }, [endMinutes, startMinutes]);

  const beginEdit = () => {
    setDraftStart(startMinutes);
    setDraftEnd(endMinutes);
    setEditing(true);
    hapticLight();
  };

  const cancelEdit = () => {
    setDraftStart(startMinutes);
    setDraftEnd(endMinutes);
    setEditing(false);
    setActiveMode(null);
    shiftOriginRef.current = null;
    atLimitRef.current = false;
    hapticLight();
  };

  const saveEdit = () => {
    if (draftStart === startMinutes && draftEnd === endMinutes) {
      setEditing(false);
      hapticLight();
      return;
    }
    hapticMedium();
    onRequestConfirm(draftStart, draftEnd);
  };

  const handleEndpointDrag = useCallback(
    (kind: 'start' | 'end', x: number, y: number) => {
      const rawMinutes = clockDegreesToMinutes(angleFromCenter(CX, CY, x, y));
      const next = clampWindowHandle(kind, rawMinutes, draftStart, draftEnd);

      const hitStartFloor = kind === 'start' && rawMinutes < SPENDING_WINDOW_BOUNDS.earliestStart;
      const hitEndCeiling = kind === 'end' && rawMinutes > SPENDING_WINDOW_BOUNDS.latestEnd;
      const atLimit = hitStartFloor || hitEndCeiling;

      if (atLimit) {
        if (!atLimitRef.current) {
          atLimitRef.current = true;
          hapticWarning();
        }
      } else {
        atLimitRef.current = false;
      }

      if (kind === 'start' && next.start !== draftStart) hapticSelection();
      if (kind === 'end' && next.end !== draftEnd) hapticSelection();

      setDraftStart(next.start);
      setDraftEnd(next.end);
    },
    [draftEnd, draftStart],
  );

  const handleShiftDrag = useCallback(
    (x: number, y: number) => {
      const origin = shiftOriginRef.current;
      if (!origin) return;

      const currentAngle = angleFromCenter(CX, CY, x, y);
      let deltaDeg = currentAngle - origin.angle;
      if (deltaDeg > 180) deltaDeg -= 360;
      if (deltaDeg < -180) deltaDeg += 360;

      const deltaMinutes = snapDelta((deltaDeg / 360) * 1440);
      const next = shiftWindowBlock(origin.start, origin.end, deltaMinutes);

      const hitFloor = next.start <= SPENDING_WINDOW_BOUNDS.earliestStart && next.start !== draftStart;
      const hitCeiling = next.end >= SPENDING_WINDOW_BOUNDS.latestEnd && next.end !== draftEnd;
      const atLimit = hitFloor || hitCeiling;

      if (atLimit) {
        if (!atLimitRef.current) {
          atLimitRef.current = true;
          hapticWarning();
        }
      } else {
        atLimitRef.current = false;
      }

      if (next.start !== draftStart || next.end !== draftEnd) hapticSelection();
      setDraftStart(next.start);
      setDraftEnd(next.end);
    },
    [draftEnd, draftStart],
  );

  const pickDragMode = useCallback(
    (x: number, y: number): DragMode => {
      const startPt = polarPoint(CX, CY, TRACK_R, minutesToClockDegrees(draftStart));
      const endPt = polarPoint(CX, CY, TRACK_R, minutesToClockDegrees(draftEnd));
      const startDist = (x - startPt.x) ** 2 + (y - startPt.y) ** 2;
      const endDist = (x - endPt.x) ** 2 + (y - endPt.y) ** 2;
      const handleRadius = (HANDLE_HIT / 2) ** 2;

      if (startDist <= handleRadius) return 'start';
      if (endDist <= handleRadius) return 'end';

      const distFromCenter = Math.sqrt((x - CX) ** 2 + (y - CY) ** 2);
      const onTrack = Math.abs(distFromCenter - TRACK_R) <= TRACK_STROKE / 2 + 10;
      if (onTrack) {
        const touchMinutes = clockDegreesToMinutes(angleFromCenter(CX, CY, x, y));
        if (isMinuteInWindow(touchMinutes, draftStart, draftEnd)) return 'shift';
      }

      return startDist <= endDist ? 'start' : 'end';
    },
    [draftEnd, draftStart],
  );

  const ringPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => editing,
        onMoveShouldSetPanResponder: () => editing,
        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          const mode = pickDragMode(locationX, locationY);
          dragModeRef.current = mode;
          setActiveMode(mode);
          atLimitRef.current = false;

          if (mode === 'shift') {
            shiftOriginRef.current = {
              start: draftStart,
              end: draftEnd,
              angle: angleFromCenter(CX, CY, locationX, locationY),
            };
          } else {
            shiftOriginRef.current = null;
          }

          hapticMedium();
        },
        onPanResponderMove: (event) => {
          const mode = dragModeRef.current;
          if (!mode) return;
          const { locationX, locationY } = event.nativeEvent;
          if (mode === 'shift') handleShiftDrag(locationX, locationY);
          else handleEndpointDrag(mode, locationX, locationY);
        },
        onPanResponderRelease: () => {
          dragModeRef.current = null;
          setActiveMode(null);
          shiftOriginRef.current = null;
          atLimitRef.current = false;
        },
        onPanResponderTerminate: () => {
          dragModeRef.current = null;
          setActiveMode(null);
          shiftOriginRef.current = null;
          atLimitRef.current = false;
        },
      }),
    [draftEnd, draftStart, editing, handleEndpointDrag, handleShiftDrag, pickDragMode],
  );

  const statusLine = hasDraftChange
    ? `Was ${formatWindowTimeHeader(startMinutes)} to ${formatWindowTimeHeader(endMinutes)}.`
    : 'Spending allowed during this window.';

  return (
    <View style={styles.shell}>
      <EndpointHeader startMinutes={displayStart} endMinutes={displayEnd} />

      <View style={styles.dialWrap}>
        <View style={styles.dialSvgLayer}>
          <DialSvg
            startMinutes={displayStart}
            endMinutes={displayEnd}
            ghostStart={startMinutes}
            ghostEnd={endMinutes}
            showGhost={hasDraftChange}
          />
        </View>
        <DialFaceLabels />
        <View {...ringPan.panHandlers} style={styles.dialTouch}>
          <ScheduleHandle kind="start" minutes={displayStart} active={activeMode === 'start'} />
          <ScheduleHandle kind="end" minutes={displayEnd} active={activeMode === 'end'} />
        </View>
      </View>

      <View style={styles.durationBlock}>
        <Text style={styles.durationValue}>{durationLabel}</Text>
        <Text style={styles.durationStatus}>{statusLine}</Text>
      </View>

      {editing ? (
        <View style={styles.editActions}>
          <Pressable
            onPress={cancelEdit}
            style={({ pressed }) => [styles.editPill, styles.editPillHalf, pressed && styles.editPillPressed]}
            accessibilityRole="button"
            accessibilityLabel="Cancel">
            <Text style={styles.editPillSecondary}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={saveEdit}
            style={({ pressed }) => [styles.editPill, styles.editPillHalf, pressed && styles.editPillPressed]}
            accessibilityRole="button"
            accessibilityLabel="Save spending window">
            <Text style={styles.editPillText}>Save</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={beginEdit}
          style={({ pressed }) => [styles.editPill, pressed && styles.editPillPressed]}
          accessibilityRole="button"
          accessibilityLabel="Edit spending window">
          <Text style={styles.editPillText}>Edit spending window</Text>
        </Pressable>
      )}
    </View>
  );
}

function snapDelta(minutes: number): number {
  return Math.round(minutes / 15) * 15;
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(60,60,67,0.12)',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 8,
  },
  dialWrap: {
    alignSelf: 'center',
    width: DIAL,
    height: DIAL,
    marginBottom: 2,
    overflow: 'visible',
  },
  dialSvgLayer: {
    ...StyleSheet.absoluteFill,
  },
  dialTouch: {
    ...StyleSheet.absoluteFill,
  },
  handleHit: {
    position: 'absolute',
    width: HANDLE_HIT,
    height: HANDLE_HIT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleCircle: {
    backgroundColor: '#d8d8de',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 4px rgba(13,13,13,0.14)',
    elevation: 2,
  },
  durationBlock: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 2,
    paddingBottom: 2,
  },
  durationValue: {
    color: AppTheme.text,
    fontSize: 20,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.2,
  },
  durationStatus: {
    color: AppTheme.textMuted,
    fontSize: 13,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  editPill: {
    marginTop: 8,
    marginHorizontal: 10,
    backgroundColor: 'rgba(60,60,67,0.08)',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  editPillHalf: {
    flex: 1,
    marginHorizontal: 0,
    marginTop: 0,
  },
  editPillPressed: {
    opacity: 0.82,
  },
  editPillText: {
    color: ACCENT,
    fontSize: 15,
    fontFamily: FontFamily.regular,
  },
  editPillSecondary: {
    color: AppTheme.textMuted,
    fontSize: 15,
    fontFamily: FontFamily.regular,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginHorizontal: 10,
  },
});
