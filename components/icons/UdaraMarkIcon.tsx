import { Image, StyleSheet } from 'react-native';

type Props = {
  size?: number;
  color: string;
};

/** Udara flower mark — tintable for tab bars and monochrome UI. */
export const UDARA_MARK_BUTTON_SIZE = 24;

export function UdaraMarkIcon({ size = 22, color }: Props) {
  return (
    <Image
      source={require('../../assets/images/udara-mark-white.png')}
      style={[styles.mark, { width: size, height: size, tintColor: color }]}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  mark: {},
});
