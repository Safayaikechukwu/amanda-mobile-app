import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { formatWindowTimeHeader, minutesToClockDegrees, polarPoint } from '@/helpers/spendingWindow';

/** Apple Sleep schedule dial — proportions matched to iOS Health card. */
export const DIAL = 268;
export const TRACK_STROKE = 26;
export const CX = DIAL / 2;
export const CY = DIAL / 2;
export const TRACK_R = (DIAL - TRACK_STROKE) / 2 - 2;
export const FACE_R = TRACK_R - TRACK_STROKE / 2 - 10;
export const LABEL_R = FACE_R - 6;
export const ICON_R = FACE_R - 22;
export const TRACK_C = 2 * Math.PI * TRACK_R;

const ACCENT = AppTheme.accent;
const TRACK_IDLE = '#d8d8de';
const FACE_FILL = '#f2f2f7';
const ACTIVE_ARC = ACCENT;

export const HOUR_LABELS: { minutes: number; label: string; major?: boolean }[] = [
  { minutes: 0, label: '12AM', major: true },
  { minutes: 120, label: '2' },
  { minutes: 240, label: '4' },
  { minutes: 360, label: '6AM', major: true },
  { minutes: 480, label: '8' },
  { minutes: 600, label: '10' },
  { minutes: 720, label: '12PM', major: true },
  { minutes: 840, label: '2' },
  { minutes: 960, label: '4' },
  { minutes: 1080, label: '6PM', major: true },
  { minutes: 1200, label: '8' },
  { minutes: 1320, label: '10' },
];

/** Decorative icons sit on an inner ring — never share the label radius. */
export const DIAL_ICONS: {
  minutes: number;
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
}[] = [
  { minutes: 0, name: 'sparkles', color: ACCENT, size: 9 },
  { minutes: 720, name: 'sunny', color: '#d97706', size: 10 },
  { minutes: 1080, name: 'moon', color: ACCENT, size: 9 },
];

function labelAnchor(minutes: number, major?: boolean) {
  const deg = minutesToClockDegrees(minutes);
  const point = polarPoint(CX, CY, LABEL_R, deg);
  const w = major ? 34 : 14;
  const h = major ? 14 : 12;
  return { left: point.x - w / 2, top: point.y - h / 2, width: w, height: h };
}

function iconAnchor(minutes: number, size: number) {
  const deg = minutesToClockDegrees(minutes);
  const point = polarPoint(CX, CY, ICON_R, deg);
  const box = size + 4;
  return { left: point.x - box / 2, top: point.y - box / 2, width: box, height: box };
}

function windowSpan(start: number, end: number): number {
  return end >= start ? end - start : end + 1440 - start;
}

function arcDash(startMinutes: number, endMinutes: number) {
  const span = windowSpan(startMinutes, endMinutes);
  const len = (span / 1440) * TRACK_C;
  const offset = (startMinutes / 1440) * TRACK_C;
  return { len, offset };
}

function ArcRing({
  startMinutes,
  endMinutes,
  stroke,
  strokeWidth = TRACK_STROKE,
  opacity = 1,
}: {
  startMinutes: number;
  endMinutes: number;
  stroke: string;
  strokeWidth?: number;
  opacity?: number;
}) {
  const { len, offset } = arcDash(startMinutes, endMinutes);
  return (
    <Circle
      cx={CX}
      cy={CY}
      r={TRACK_R}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="butt"
      strokeDasharray={`${len} ${TRACK_C - len}`}
      strokeDashoffset={-offset}
      transform={`rotate(-90 ${CX} ${CY})`}
      opacity={opacity}
    />
  );
}

function FaceTicks() {
  const ticks: ReactNode[] = [];
  for (let m = 0; m < 1440; m += 30) {
    const deg = minutesToClockDegrees(m);
    const major = m % 120 === 0;
    const a = polarPoint(CX, CY, FACE_R, deg);
    const b = polarPoint(CX, CY, FACE_R + (major ? 5 : 2.5), deg);
    ticks.push(
      <Line
        key={`tick-${m}`}
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke="rgba(60,60,67,0.18)"
        strokeWidth={major ? 1 : 0.6}
      />,
    );
  }
  return <>{ticks}</>;
}

function ArcRadialTexture({ startMinutes, endMinutes }: { startMinutes: number; endMinutes: number }) {
  const innerR = TRACK_R - TRACK_STROKE / 2 + 3;
  const outerR = TRACK_R + TRACK_STROKE / 2 - 3;
  const startDeg = minutesToClockDegrees(startMinutes);
  const endDeg = minutesToClockDegrees(endMinutes);
  const lines: ReactNode[] = [];

  for (let deg = startDeg; deg <= endDeg; deg += 1.8) {
    const inner = polarPoint(CX, CY, innerR, deg);
    const outer = polarPoint(CX, CY, outerR, deg);
    lines.push(
      <Line
        key={`band-${deg.toFixed(1)}`}
        x1={inner.x}
        y1={inner.y}
        x2={outer.x}
        y2={outer.y}
        stroke="rgba(255,255,255,0.34)"
        strokeWidth={0.55}
      />,
    );
  }

  return <>{lines}</>;
}

export function EndpointHeader({ startMinutes, endMinutes }: { startMinutes: number; endMinutes: number }) {
  return (
    <View style={styles.endpointRow}>
      <View style={styles.endpointCol}>
        <View style={styles.endpointLabelRow}>
          <Ionicons name="bed" size={10} color={ACCENT} />
          <Text style={styles.endpointLabel}>CLOSES</Text>
        </View>
        <Text style={styles.endpointTime}>{formatWindowTimeHeader(endMinutes)}</Text>
        <Text style={styles.endpointSub}>Today</Text>
      </View>
      <View style={styles.endpointCol}>
        <View style={styles.endpointLabelRow}>
          <Ionicons name="alarm" size={10} color={ACCENT} />
          <Text style={styles.endpointLabel}>OPENS</Text>
        </View>
        <Text style={styles.endpointTime}>{formatWindowTimeHeader(startMinutes)}</Text>
        <Text style={styles.endpointSub}>Today</Text>
      </View>
    </View>
  );
}

export function DialFaceLabels() {
  return (
    <>
      {HOUR_LABELS.map((item) => {
        const anchor = labelAnchor(item.minutes, item.major);
        return (
          <View
            key={item.minutes}
            style={[styles.dialLabel, anchor]}
            pointerEvents="none">
            <Text style={[styles.dialLabelText, item.major && styles.dialLabelMajor]}>{item.label}</Text>
          </View>
        );
      })}
      {DIAL_ICONS.map((item) => {
        const anchor = iconAnchor(item.minutes, item.size);
        return (
          <View
            key={`icon-${item.minutes}`}
            style={[styles.dialIcon, anchor]}
            pointerEvents="none">
            <Ionicons name={item.name} size={item.size} color={item.color} />
          </View>
        );
      })}
    </>
  );
}

export function DialSvg({
  startMinutes,
  endMinutes,
  ghostStart,
  ghostEnd,
  showGhost,
}: {
  startMinutes: number;
  endMinutes: number;
  ghostStart?: number;
  ghostEnd?: number;
  showGhost?: boolean;
}) {
  return (
    <Svg width={DIAL} height={DIAL}>
      <Circle cx={CX} cy={CY} r={FACE_R + 6} fill={FACE_FILL} />
      <FaceTicks />
      <Circle cx={CX} cy={CY} r={TRACK_R} stroke={TRACK_IDLE} strokeWidth={TRACK_STROKE} fill="none" />
      {showGhost && ghostStart != null && ghostEnd != null ? (
        <ArcRing startMinutes={ghostStart} endMinutes={ghostEnd} stroke="rgba(74,5,8,0.14)" />
      ) : null}
      <ArcRing startMinutes={startMinutes} endMinutes={endMinutes} stroke={ACTIVE_ARC} />
      <ArcRadialTexture startMinutes={startMinutes} endMinutes={endMinutes} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  endpointRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 2,
  },
  endpointCol: {
    flex: 1,
    alignItems: 'center',
  },
  endpointLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  endpointLabel: {
    color: ACCENT,
    fontSize: 9,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.4,
  },
  endpointTime: {
    color: AppTheme.text,
    fontSize: 20,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.4,
    lineHeight: 23,
  },
  endpointSub: {
    color: AppTheme.textMuted,
    fontSize: 12,
    fontFamily: FontFamily.regular,
    marginTop: 1,
  },
  dialLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialLabelText: {
    color: AppTheme.textMuted,
    fontSize: 9,
    fontFamily: FontFamily.medium,
    textAlign: 'center',
  },
  dialLabelMajor: {
    color: AppTheme.text,
    fontSize: 10,
    fontFamily: FontFamily.semibold,
  },
  dialIcon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
