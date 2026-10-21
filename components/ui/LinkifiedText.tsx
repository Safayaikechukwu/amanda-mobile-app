import { Pressable, StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { openLink, parseTextWithLinks } from '@/helpers/openLink';

type Props = TextProps & {
  linkStyle?: TextStyle;
  /** Light links on dark bubble backgrounds (user messages). */
  variant?: 'default' | 'onDark';
};

export function LinkifiedText({ style, linkStyle, variant = 'default', ...rest }: Props) {
  const text = typeof rest.children === 'string' ? rest.children : '';
  const parts = parseTextWithLinks(text);

  const linkColor = variant === 'onDark' ? '#fff' : AppTheme.accent;

  return (
    <Text {...rest} style={style}>
      {parts.map((part, index) =>
        part.type === 'link' ? (
          <Text
            key={`link-${index}`}
            style={[style, styles.link, { color: linkColor }, linkStyle]}
            onPress={() => void openLink(part.url)}
            suppressHighlighting
            accessibilityRole="link">
            {part.value}
          </Text>
        ) : (
          <Text key={`text-${index}`} style={style}>
            {part.value}
          </Text>
        ),
      )}
    </Text>
  );
}

/** Standalone tappable link — terms, support URLs, etc. */
export function AppLink({
  url,
  children,
  style,
}: {
  url: string;
  children: string;
  style?: TextStyle;
}) {
  return (
    <Pressable
      onPress={() => void openLink(url)}
      accessibilityRole="link"
      hitSlop={4}>
      <Text style={[styles.link, { color: AppTheme.accent }, style]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    textDecorationLine: 'underline',
    fontFamily: FontFamily.medium,
  },
});
