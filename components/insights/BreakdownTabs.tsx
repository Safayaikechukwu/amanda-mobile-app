import { SegmentRail } from '@/components/insights/SegmentRail';

export type BreakdownKey = 'categories' | 'recipients';

const ITEMS: { key: BreakdownKey; label: string }[] = [
  { key: 'categories', label: 'Categories' },
  { key: 'recipients', label: 'Recipients' },
];

type Props = {
  value: BreakdownKey;
  onChange: (key: BreakdownKey) => void;
};

/** Overview rail — thin wrapper over SegmentRail. */
export function BreakdownTabs({ value, onChange }: Props) {
  return <SegmentRail items={ITEMS} value={value} onChange={onChange} />;
}
