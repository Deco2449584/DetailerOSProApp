import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

type StatCardProps = {
  title: string;
  value: number;
  accentColor: string;
};

export function StatCard({ title, value, accentColor }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface.elevated,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  accentBar: {
    width: 32,
    height: 3,
    borderRadius: 2,
    marginBottom: 4,
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text.onSurface,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.onSurfaceMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
