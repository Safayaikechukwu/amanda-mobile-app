import { Ionicons } from '@expo/vector-icons';
import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';

type Props = {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
};

/** Section header with chevron — collapses template picker tables on bucket screens. */
export function CollapsibleTemplateSection({
  title,
  children,
  defaultExpanded = true,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setExpanded((open) => !open)}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${title}, ${expanded ? 'Show less' : 'Show more'}`}>
        <Text style={styles.title}>{title}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={AppTheme.textMuted}
        />
      </Pressable>
      {expanded ? children : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginTop: 4,
    marginBottom: 2,
    gap: 8,
  },
  title: {
    flex: 1,
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.25,
  },
  pressed: { opacity: 0.75 },
});
