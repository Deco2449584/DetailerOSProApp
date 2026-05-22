import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import { FineShineLogo } from '@/components/FineShineLogo';
import { RecordsSearchBar } from '@/components/RecordsSearchBar';
import { StatCard } from '@/components/StatCard';
import { VehicleCard } from '@/components/VehicleCard';
import { useAuth } from '@/context/AuthContext';
import { useVehicles } from '@/context/VehiclesContext';
import type { Vehicle, VehicleType } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { brand } from '@/theme/brand';
import type { AppColors } from '@/theme/palettes';
import { fonts } from '@/theme/typography';
import { getRoleLabel } from '@/services/userRepository';
import { filterVehiclesBySearch } from '@/utils/filterVehicles';

function typeAccents(colors: AppColors): Record<string, string> {
  return {
    nuevo: colors.accent.primary,
    usado: colors.semantic.info,
    redetailing: colors.semantic.warning,
  };
}

function countByType(vehicles: Vehicle[], type: VehicleType): number {
  return vehicles.filter((v) => v.type === type).length;
}

function createIndexStyles(colors: AppColors) {
  return StyleSheet.create({
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
      color: colors.text.mutedOnDark,
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
}

export default function RecordsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(createIndexStyles);
  const accents = useMemo(() => typeAccents(colors), [colors]);
  const { user, isAdmin, role, isLoading: authLoading } = useAuth();
  const { vehicles, isLoading: vehiclesLoading, isRefreshing, error: vehiclesError, refreshRecords } =
    useVehicles();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVehicles = useMemo(
    () => filterVehiclesBySearch(vehicles, searchQuery),
    [vehicles, searchQuery],
  );

  const counts = useMemo(
    () => ({
      nuevo: countByType(filteredVehicles, 'nuevo'),
      usado: countByType(filteredVehicles, 'usado'),
      redetailing: countByType(filteredVehicles, 'redetailing'),
    }),
    [filteredVehicles],
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
        data={filteredVehicles}
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshRecords}
            tintColor={colors.accent.primary}
            colors={[colors.accent.primary]}
          />
        }
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
                  <Text style={styles.adminBadge}>
                    All team records · {getRoleLabel(role)}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.statsRow}>
              <StatCard
                title="New"
                value={counts.nuevo}
                accentColor={accents.nuevo}
                icon="sparkles-outline"
              />
              <StatCard
                title="Used"
                value={counts.usado}
                accentColor={accents.usado}
                icon="car-outline"
              />
              <StatCard
                title="Redetailing"
                value={counts.redetailing}
                accentColor={accents.redetailing}
                icon="color-wand-outline"
              />
            </View>

            <RecordsSearchBar value={searchQuery} onChangeText={setSearchQuery} />

            {vehiclesError ? (
              <Text style={styles.errorBanner}>
                Could not load records: {vehiclesError}
              </Text>
            ) : null}

            <Text style={styles.sectionTitle}>
              {isAdmin ? 'All records' : 'Recent records'}
            </Text>
            {filteredVehicles.length > 0 ? (
              <Text style={styles.sectionHint}>
                {searchQuery.trim()
                  ? `${filteredVehicles.length} match(es) · tap to view`
                  : 'Tap a record to view details and photos'}
              </Text>
            ) : searchQuery.trim() ? (
              <Text style={styles.sectionHint}>No records match your search</Text>
            ) : null}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={colors.text.secondary} />
            <Text style={styles.emptyTitle}>
              {searchQuery.trim() ? 'No matches' : 'No records yet'}
            </Text>
            <Text style={styles.emptyHint}>
              {searchQuery.trim()
                ? 'Try another VIN or model keyword.'
                : 'Use the Scan tab to create your first inspection record.'}
            </Text>
          </View>
        }
        ListFooterComponent={<Text style={styles.footerLicense}>{brand.license}</Text>}
      />
    </SafeAreaView>
  );
}
