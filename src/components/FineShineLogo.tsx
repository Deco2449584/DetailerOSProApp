import { Image } from 'expo-image';
import { StyleSheet, View, type ViewStyle } from 'react-native';

const logoLight = require('../../assets/brand/logo-light.webp');

type FineShineLogoProps = {
  width?: number;
  style?: ViewStyle;
};

export function FineShineLogo({ width = 200, style }: FineShineLogoProps) {
  const height = width * (303 / 400);

  return (
    <View style={[styles.wrap, style]}>
      <Image source={logoLight} style={{ width, height }} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
});
