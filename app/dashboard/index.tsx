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

  const greetingName = user.email?.split('@')[0] ?? 'Operator';

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
            <View style={styles.brandRow}>
              <FineShineLogo width={140} style={styles.headerLogo} />
            </View>

            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.greeting}>Hi, {greetingName}</Text>
                <Text style={styles.headerSubtitle}>
                  {brand.panelTitle} · {brand.location}
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.signOutBtn, pressed && styles.signOutPressed]}
                onPress={signOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
              </Pressable>
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

            <Pressable
              style={({ pressed }) => [
                styles.scanButton,
                pressed && styles.scanButtonPressed,
              ]}
              onPress={handleStartScan}>
              <Text style={styles.scanButtonText}>Start Scan (Read VIN)</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>Recent Records</Text>
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
              Scan a vehicle VIN to create your first inspection record.
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 12,
  },
  headerText: {
    flex: 1,
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
    fontFamily: fonts.headingSemiBold,
    fontSize: 17,
    color: colors.text.onAccent,
    letterSpacing: 0.3,
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
