import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';

/**
 * Pantalla de entrada provisional.
 * Más adelante redirigirá a login o dashboard según el estado de autenticación.
 */
export default function IndexScreen() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});
