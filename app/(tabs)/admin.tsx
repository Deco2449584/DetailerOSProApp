import { Redirect } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';
import { useVehicles } from '@/context/VehiclesContext';
import { brand } from '@/theme/brand';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { shareVehiclesAsCsv, shareVehiclesAsExcel } from '@/utils/exportVehicles';

export default function AdminScreen() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  const [isExporting, setIsExporting] = useState<'csv' | 'excel' | null>(null);

  if (!authLoading && !isAdmin) {
    return <Redirect href="/(tabs)" />;
  }

  const handleExport = async (format: 'csv' | 'excel') => {
    if (vehicles.length === 0) {
      Alert.alert('No records', 'There are no records to export yet.');
      return;
    }

    setIsExporting(format);
    try {
      if (format === 'csv') {
        await shareVehiclesAsCsv(vehicles);
      } else {
        await shareVehiclesAsExcel(vehicles);
      }
    } catch {
      Alert.alert('Export failed', 'Could not create or share the file. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  if (authLoading || vehiclesLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={28} color={colors.accent.primary} />
          </View>
          <Text style={styles.title}>Admin panel</Text>
          <Text style={styles.subtitle}>
            Export all inspection records from {brand.name}. Open vehicle details to generate a
            PDF report per vehicle.
          </Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsValue}>{vehicles.length}</Text>
          <Text style={styles.statsLabel}>Total records in database</Text>
        </View>

        <Text style={styles.sectionTitle}>Download reports</Text>

        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
          disabled={isExporting !== null}
          onPress={() => handleExport('csv')}>
          <Ionicons name="document-text-outline" size={22} color={colors.text.onAccent} />
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Export CSV</Text>
            <Text style={styles.actionHint}>Spreadsheet-compatible file</Text>
          </View>
          {isExporting === 'csv' ? (
            <ActivityIndicator color={colors.text.onAccent} />
          ) : (
            <Ionicons name="download-outline" size={22} color={colors.text.onAccent} />
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionBtnSecondary, pressed && styles.actionBtnPressed]}
          disabled={isExporting !== null}
          onPress={() => handleExport('excel')}>
          <Ionicons name="grid-outline" size={22} color={colors.accent.primary} />
          <View style={styles.actionText}>
            <Text style={styles.actionTitleDark}>Export Excel</Text>
            <Text style={styles.actionHintDark}>Opens in Excel / Google Sheets</Text>
          </View>
          {isExporting === 'excel' ? (
            <ActivityIndicator color={colors.accent.primary} />
          ) : (
            <Ionicons name="download-outline" size={22} color={colors.accent.primary} />
          )}
        </Pressable>

        <Text style={styles.footerNote}>
          CSV includes VIN, model, type, status, colour, comments, photo count, operator and date.
        </Text>
      </View>
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
  content: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  hero: {
    gap: 10,
    marginBottom: 8,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(226, 31, 40, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  statsCard: {
    backgroundColor: colors.surface.elevated,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  statsValue: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.accent.primary,
  },
  statsLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text.onSurfaceMuted,
  },
  sectionTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 16,
    color: colors.text.primary,
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.accent.primary,
    borderRadius: 14,
    padding: 16,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface.elevated,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  actionBtnPressed: {
    opacity: 0.88,
  },
  actionText: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 16,
    color: colors.text.onAccent,
  },
  actionTitleDark: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 16,
    color: colors.text.onSurface,
  },
  actionHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  actionHintDark: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.text.onSurfaceMuted,
  },
  footerNote: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
    marginTop: 8,
  },
});
