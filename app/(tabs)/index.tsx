import { useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import { FineShineLogo } from '@/components/FineShineLogo';
import { StatCard } from '@/components/StatCard';
import { VehicleCard } from '@/components/VehicleCard';
import { useAuth } from '@/context/AuthContext';
import { useVehicles } from '@/context/VehiclesContext';
import type { Vehicle, VehicleType } from '@/types';
import { brand } from '@/theme/brand';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { getRoleLabel } from '@/services/userRepository';

const TYPE_ACCENTS: Record<VehicleType, string> = {
  nuevo: colors.accent.primary,
  usado: colors.semantic.info,
  redetailing: colors.semantic.warning,
};

function countByType(vehicles: Vehicle[], type: VehicleType): number {
  return vehicles.filter((v) => v.type === type).length;
}

export default function RecordsScreen() {
  const router = useRouter();
  const { user, isAdmin, role, isLoading: authLoading } = useAuth();
  const { vehicles, isLoading: vehiclesLoading, error: vehiclesError } = useVehicles();

  const counts = useMemo(
    () => ({
      nuevo: countByType(vehicles, 'nuevo'),
      usado: countByType(vehicles, 'usado'),
      redetailing: countByType(vehicles, 'redetailing'),
    }),
    [vehicles],
  );

  const isLoading = authLoading || vehiclesLoading;
  const greetingName = user?.email?.split('@')[0] ?? 'Operator';

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </View>
    );
  }

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
            <View style={styles.brandRow}>
              <FineShineLogo width={140} style={styles.headerLogo} />
            </View>

            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.greeting}>Hi, {greetingName}</Text>
                <Text style={styles.headerSubtitle}>
                  {brand.panelTitle} · {brand.location}
                </Text>
                {isAdmin ? (
                  <Text style={styles.adminBadge}>All team records · {getRoleLabel(role)}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.statsRow}>
              <StatCard
                title="New"
                value={counts.nuevo}
                accentColor={TYPE_ACCENTS.nuevo}
                icon="sparkles-outline"
              />
              <StatCard
                title="Used"
                value={counts.usado}
                accentColor={TYPE_ACCENTS.usado}
                icon="car-outline"
              />
              <StatCard
                title="Redetailing"
                value={counts.redetailing}
                accentColor={TYPE_ACCENTS.redetailing}
                icon="color-wand-outline"
              />
            </View>

            {vehiclesError ? (
              <Text style={styles.errorBanner}>
                Could not load records: {vehiclesError}
              </Text>
            ) : null}

            <Text style={styles.sectionTitle}>
              {isAdmin ? 'All records' : 'Recent records'}
            </Text>
            {vehicles.length > 0 ? (
              <Text style={styles.sectionHint}>Tap a record to view details and photos</Text>
            ) : null}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={colors.text.secondary} />
            <Text style={styles.emptyTitle}>No records yet</Text>
            <Text style={styles.emptyHint}>
              Use the Scan tab to create your first inspection record.
            </Text>
          </View>
        }
        ListFooterComponent={<Text style={styles.footerLicense}>{brand.license}</Text>}
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
  brandRow: {
    alignItems: 'flex-start',
    marginTop: 4,
    marginBottom: 16,
  },
  headerLogo: {
    alignItems: 'flex-start',
  },
  header: {
    marginBottom: 24,
  },
  headerText: {
    gap: 4,
  },
  greeting: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text.secondary,
  },
  adminBadge: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.accent.primary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  errorBanner: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.semantic.error,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    lineHeight: 18,
  },
  sectionTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: 4,
  },
  sectionHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 18,
    color: colors.text.primary,
    textAlign: 'center',
  },
  emptyHint: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLicense: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
});
