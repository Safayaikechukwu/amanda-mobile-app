import Feather from '@expo/vector-icons/Feather';

type Props = { size?: number; color?: string };

export function PhoneIcon({ size = 20, color = '#0d0d0d' }: Props) {
  return <Feather name="phone" size={size} color={color} />;
}
