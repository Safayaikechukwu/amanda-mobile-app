import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Theme } from '@/constants/Theme';

type Props = { children: ReactNode };

export function GradientBackground({ children }: Props) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Theme.color.oxbloodSoft, Theme.color.cta, Theme.color.darkFade, Theme.color.darkInk]}
        locations={[0, 0.32, 0.68, 1]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Theme.color.darkInk },
});
