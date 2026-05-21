import { Redirect, useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatCard } from '@/components/StatCard';
import { VehicleCard } from '@/components/VehicleCard';
import { useAuth } from '@/context/AuthContext';
import { useVehicles } from '@/context/VehiclesContext';
import type { Vehicle, VehicleType } from '@/types';
import { colors } from '@/theme/colors';

const TYPE_ACCENTS: Record<VehicleType, string> = {
  nuevo: colors.accent.primary,
  usado: colors.semantic.info,
  redetailing: colors.semantic.warning,
};

function countByType(vehicles: Vehicle[], type: VehicleType): number {
  return vehicles.filter((v) => v.type === type).length;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();

  const counts = useMemo(
    () => ({
      nuevo: countByType(vehicles, 'nuevo'),
      usado: countByType(vehicles, 'usado'),
      redetailing: countByType(vehicles, 'redetailing'),
    }),
    [vehicles],
  );

  const isLoading = authLoading || vehiclesLoading;

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const greetingName = user.email?.split('@')[0] ?? 'Operador';

  const handleStartScan = () => {
    router.push('/scanner' as Href);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onPress={() =>
              router.push(`/vehicle/${encodeURIComponent(item.id)}` as Href)
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.greeting}>Hola, {greetingName}</Text>
                <Text style={styles.headerSubtitle}>Panel de operaciones Tesla</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.signOutBtn, pressed && styles.signOutPressed]}
                onPress={signOut}>
                <Text style={styles.signOutText}>Cerrar Sesión</Text>
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              <StatCard title="Nuevos" value={counts.nuevo} accentColor={TYPE_ACCENTS.nuevo} />
              <StatCard title="Usados" value={counts.usado} accentColor={TYPE_ACCENTS.usado} />
              <StatCard
                title="Redetailing"
                value={counts.redetailing}
                accentColor={TYPE_ACCENTS.redetailing}
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.scanButton,
                pressed && styles.scanButtonPressed,
              ]}
              onPress={handleStartScan}>
              <Text style={styles.scanButtonText}>Iniciar Escaneo (Leer VIN)</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>Registros Recientes</Text>
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 24,
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  signOutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  signOutPressed: {
    opacity: 0.7,
  },
  signOutText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  scanButtonPressed: {
    backgroundColor: colors.accent.primaryPressed,
  },
  scanButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.onSurface,
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
});
