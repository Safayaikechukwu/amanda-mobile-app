import AntDesign from '@expo/vector-icons/AntDesign';

type Props = { size?: number };

export function GoogleIcon({ size = 20 }: Props) {
  return <AntDesign name="google" size={size} color="#4285F4" />;
}
