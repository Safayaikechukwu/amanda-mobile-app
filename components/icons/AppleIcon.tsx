import FontAwesome from '@expo/vector-icons/FontAwesome';

type Props = { size?: number; color?: string };

export function AppleIcon({ size = 20, color = '#0d0d0d' }: Props) {
  return <FontAwesome name="apple" size={size} color={color} />;
}
