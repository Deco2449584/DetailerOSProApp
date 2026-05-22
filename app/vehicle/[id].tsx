import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useVehicleCatalog } from '@/context/VehicleCatalogContext';
import { useVehicles } from '@/context/VehiclesContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { brand } from '@/theme/brand';
import type { AppColors } from '@/theme/palettes';
import { fonts } from '@/theme/typography';
import { formatVehicleDate } from '@/utils/formatDate';
import { shareVehiclePdf } from '@/utils/vehiclePdf';
import { getTypeColor, STATUS_COLORS, STATUS_LABELS } from '@/utils/vehicleLabels';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PHOTO_WIDTH = SCREEN_WIDTH - 40;
const PHOTO_HEIGHT = 220;

function createDetailStyles(colors: AppColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
    },
    content: {
      padding: 20,
      gap: 16,
    },
    headerEditBtn: {
      marginRight: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: -4,
    },
    badges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.accent.primary,
      backgroundColor: 'rgba(226, 31, 40, 0.08)',
    },
    actionBtnPressed: {
      opacity: 0.85,
    },
    actionBtnText: {
      fontFamily: fonts.headingSemiBold,
      fontSize: 15,
      color: colors.accent.primary,
    },
    pdfBtnOutline: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.accent.primary,
      paddingVertical: 14,
      marginTop: 8,
    },
    pdfBtnOutlinePressed: {
      backgroundColor: 'rgba(226, 31, 40, 0.08)',
    },
    pdfBtnOutlineText: {
      fontFamily: fonts.headingSemiBold,
      fontSize: 16,
      color: colors.accent.primary,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    card: {
      backgroundColor: colors.surface.card,
      borderRadius: 14,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border.onSurface,
    },
    row: {
      gap: 4,
    },
    rowLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text.onSurfaceMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    rowValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.onSurface,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text.onSurface,
    },
    comments: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.text.onSurface,
    },
    gallery: {
      gap: 12,
      paddingVertical: 4,
    },
    photoWrap: {
      width: PHOTO_WIDTH,
      gap: 6,
    },
    photo: {
      width: PHOTO_WIDTH,
      height: PHOTO_HEIGHT,
      borderRadius: 12,
      backgroundColor: colors.surface.muted,
    },
    photoIndex: {
      fontSize: 12,
      color: colors.text.onSurfaceMuted,
      textAlign: 'center',
    },
    noPhotos: {
      fontSize: 14,
      color: colors.text.onSurfaceMuted,
      fontStyle: 'italic',
    },
    notFound: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    notFoundTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text.primary,
    },
  });
}

function DetailRow({
  label,
  value,
  rowStyle,
  labelStyle,
  valueStyle,
}: {
  label: string;
  value: string;
  rowStyle: ViewStyle;
  labelStyle: TextStyle;
  valueStyle: TextStyle;
}) {
  return (
    <View style={rowStyle}>
      <Text style={labelStyle}>{label}</Text>
      <Text style={valueStyle}>{value}</Text>
    </View>
  );
}

function Badge({
  label,
  backgroundColor,
  textColor,
  badgeStyle,
  badgeTextStyle,
}: {
  label: string;
  backgroundColor: string;
  textColor: string;
  badgeStyle: ViewStyle;
  badgeTextStyle: TextStyle;
}) {
  return (
    <View style={[badgeStyle, { backgroundColor }]}>
      <Text style={[badgeTextStyle, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export default function VehicleDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(createDetailStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const { getTypeLabel } = useVehicleCatalog();
  const { vehicles, isLoading } = useVehicles();
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const vehicle = useMemo(
    () => vehicles.find((item) => item.id === id),
    [vehicles, id],
  );

  const handleAdminEdit = () => {
    if (!vehicle || !isAdmin) return;
    router.push({
      pathname: '/scanner',
      params: { editId: vehicle.id },
    } as Href);
  };

  const handleAppendUpdate = () => {
    if (!vehicle) return;
    router.push({
      pathname: '/scanner',
      params: { appendId: vehicle.id },
    } as Href);
  };

  const handleExportPdf = async () => {
    if (!vehicle) return;
    setIsPdfLoading(true);
    try {
      await shareVehiclePdf(vehicle);
    } catch {
      Alert.alert('PDF failed', 'Could not generate or share the report. Please try again.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Record',
            headerStyle: { backgroundColor: colors.background.primary },
            headerTintColor: colors.text.primary,
            headerShadowVisible: false,
          }}
        />
        <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
          <View style={styles.notFound}>
            <Text style={styles.notFoundTitle}>Record not found</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const statusStyle = STATUS_COLORS[vehicle.status];
  const typeStyle = getTypeColor(vehicle.type);

  return (
    <>
      <Stack.Screen
        options={{
          title: vehicle.model,
          headerStyle: { backgroundColor: colors.background.primary },
          headerTintColor: colors.text.primary,
          headerTitleStyle: { fontFamily: fonts.headingSemiBold, color: colors.text.primary },
          headerShadowVisible: false,
          headerRight: isAdmin
            ? () => (
                <Pressable onPress={handleAdminEdit} hitSlop={12} style={styles.headerEditBtn}>
                  <Ionicons name="create-outline" size={24} color={colors.accent.primary} />
                </Pressable>
              )
            : undefined,
        }}
      />
      <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>{brand.name} · Vehicle details</Text>

          <View style={styles.badges}>
            <Badge
              label={STATUS_LABELS[vehicle.status]}
              backgroundColor={statusStyle.bg}
              textColor={statusStyle.text}
              badgeStyle={styles.badge}
              badgeTextStyle={styles.badgeText}
            />
            <Badge
              label={getTypeLabel(vehicle.type)}
              backgroundColor={typeStyle.bg}
              textColor={typeStyle.text}
              badgeStyle={styles.badge}
              badgeTextStyle={styles.badgeText}
            />
          </View>

          {isAdmin ? (
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
              onPress={handleAdminEdit}>
              <Ionicons name="create-outline" size={20} color={colors.accent.primary} />
              <Text style={styles.actionBtnText}>Edit record (admin)</Text>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
              onPress={handleAppendUpdate}>
              <Ionicons name="add-circle-outline" size={20} color={colors.accent.primary} />
              <Text style={styles.actionBtnText}>Add photos & comments</Text>
            </Pressable>
          )}

          <View style={styles.card}>
            {isAdmin && vehicle.createdByEmail ? (
              <DetailRow
                label="Operator"
                value={vehicle.createdByEmail}
                rowStyle={styles.row}
                labelStyle={styles.rowLabel}
                valueStyle={styles.rowValue}
              />
            ) : null}
            <DetailRow
              label="VIN"
              value={vehicle.vin}
              rowStyle={styles.row}
              labelStyle={styles.rowLabel}
              valueStyle={styles.rowValue}
            />
            <DetailRow
              label="Model"
              value={vehicle.model}
              rowStyle={styles.row}
              labelStyle={styles.rowLabel}
              valueStyle={styles.rowValue}
            />
            <DetailRow
              label="Type"
              value={getTypeLabel(vehicle.type)}
              rowStyle={styles.row}
              labelStyle={styles.rowLabel}
              valueStyle={styles.rowValue}
            />
            <DetailRow
              label="Status"
              value={STATUS_LABELS[vehicle.status]}
              rowStyle={styles.row}
              labelStyle={styles.rowLabel}
              valueStyle={styles.rowValue}
            />
            <DetailRow
              label="Colour"
              value={vehicle.color}
              rowStyle={styles.row}
              labelStyle={styles.rowLabel}
              valueStyle={styles.rowValue}
            />
            <DetailRow
              label="Registered"
              value={formatVehicleDate(vehicle.createdAt)}
              rowStyle={styles.row}
              labelStyle={styles.rowLabel}
              valueStyle={styles.rowValue}
            />
            {vehicle.updatedAt ? (
              <DetailRow
                label="Last updated"
                value={formatVehicleDate(vehicle.updatedAt)}
                rowStyle={styles.row}
                labelStyle={styles.rowLabel}
                valueStyle={styles.rowValue}
              />
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Comments</Text>
            <Text style={styles.comments}>
              {vehicle.comments.trim() || 'No comments recorded.'}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>
              Photo evidence ({vehicle.imagesUrls.length})
            </Text>
            {vehicle.imagesUrls.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.gallery}>
                {vehicle.imagesUrls.map((uri, index) => (
                  <View key={`${uri}-${index}`} style={styles.photoWrap}>
                    <Image source={{ uri }} style={styles.photo} contentFit="cover" />
                    <Text style={styles.photoIndex}>
                      {index + 1} / {vehicle.imagesUrls.length}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noPhotos}>No photos attached to this record.</Text>
            )}
          </View>

          {isAdmin ? (
            <Pressable
              style={({ pressed }) => [styles.pdfBtnOutline, pressed && styles.pdfBtnOutlinePressed]}
              onPress={handleExportPdf}
              disabled={isPdfLoading}>
              {isPdfLoading ? (
                <ActivityIndicator color={colors.accent.primary} />
              ) : (
                <>
                  <Ionicons name="document-outline" size={22} color={colors.accent.primary} />
                  <Text style={styles.pdfBtnOutlineText}>Export PDF report</Text>
                </>
              )}
            </Pressable>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
