import { Text as RNText, TextProps, TextStyle } from 'react-native';

import { FontFamily } from '@/constants/Fonts';
import { Theme } from '@/constants/Theme';

type Variant = 'logo' | 'title' | 'subtitle' | 'body' | 'label' | 'button' | 'caption' | 'balance';

type Props = TextProps & {
  variant?: Variant;
  muted?: boolean;
  inverted?: boolean;
};

const variantStyle: Record<Variant, TextStyle> = {
  logo: { ...Theme.type.logo, fontFamily: FontFamily.semibold },
  title: { ...Theme.type.title, fontFamily: FontFamily.bold },
  subtitle: { ...Theme.type.subtitle, fontFamily: FontFamily.regular },
  body: { ...Theme.type.body, fontFamily: FontFamily.regular },
  label: {
    ...Theme.type.label,
    fontFamily: FontFamily.semibold,
    textTransform: 'uppercase',
  },
  button: { ...Theme.type.button, fontFamily: FontFamily.medium },
  caption: { ...Theme.type.caption, fontFamily: FontFamily.regular },
  balance: { ...Theme.type.balance, fontFamily: FontFamily.bold },
};

export function Text({ variant = 'body', muted, inverted, style, ...props }: Props) {
  const color = inverted
    ? muted
      ? Theme.color.whiteMuted
      : Theme.color.white
    : muted
      ? Theme.color.muted
      : Theme.color.ink;

  return (
    <RNText
      {...props}
      style={[{ color }, variantStyle[variant], style]}
    />
  );
}
