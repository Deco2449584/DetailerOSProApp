import { Image } from 'expo-image';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

const logoLight = require('../../assets/brand/logo-light.webp');

type FineShineLogoProps = {
  width?: number;
  style?: ViewStyle;
};

export function FineShineLogo({ width = 200, style }: FineShineLogoProps) {
  const { isDark } = useTheme();
  const height = width * (303 / 400);

  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={logoLight}
        style={{
          width,
          height,
          tintColor: isDark ? undefined : '#000000',
        }}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
});
