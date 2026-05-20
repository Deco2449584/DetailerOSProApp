import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';

/**
 * Pantalla de entrada provisional.
 * Más adelante redirigirá a login o dashboard según el estado de autenticación.
 */
export default function IndexScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Detaileros Pro</Text>
        <Text style={styles.subtitle}>App lista — pantalla de entrada provisional</Text>
        <View style={styles.accentBar} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.text.secondary,
  },
  accentBar: {
    marginTop: 24,
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent.primary,
  },
});
