import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { useVehicleCatalog } from '@/context/VehicleCatalogContext';
import type { Vehicle } from '@/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import type { AppColors } from '@/theme/palettes';
import { formatVehicleDate } from '@/utils/formatDate';
import { getTypeColor, STATUS_COLORS, STATUS_LABELS } from '@/utils/vehicleLabels';

type VehicleCardProps = {
  vehicle: Vehicle;
  onPress?: () => void;
};

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      gap: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border.onSurface,
    },
    cardPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.99 }],
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    carIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: 'rgba(226, 31, 40, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleBlock: {
      flex: 1,
      gap: 2,
    },
    model: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text.onSurface,
    },
    vin: {
      fontSize: 12,
      fontFamily: 'monospace',
      color: colors.text.onSurfaceMuted,
      letterSpacing: 0.3,
    },
    date: {
      fontSize: 11,
      color: colors.text.onSurfaceMuted,
      marginTop: 2,
    },
    chevron: {
      marginTop: 10,
    },
    badges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      paddingLeft: 56,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600',
    },
  });
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
  badgeStyle: object;
  badgeTextStyle: object;
}) {
  return (
    <View style={[badgeStyle, { backgroundColor }]}>
      <Text style={[badgeTextStyle, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export function VehicleCard({ vehicle, onPress }: VehicleCardProps) {
  const { getTypeLabel } = useVehicleCatalog();
  const styles = useThemedStyles(createStyles);
  const { colors, isDark } = useTheme();
  const statusStyle = STATUS_COLORS[vehicle.status];
  const typeStyle = getTypeColor(vehicle.type);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.topRow}>
        <View style={styles.carIconWrap}>
          <Ionicons name="car-sport" size={22} color={colors.accent.primary} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.model} numberOfLines={1}>
            {vehicle.model}
          </Text>
          <Text style={styles.vin}>VIN: {vehicle.vin}</Text>
          <Text style={styles.date}>{formatVehicleDate(vehicle.createdAt)}</Text>
        </View>
        {onPress ? (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.text.onSurfaceMuted}
            style={styles.chevron}
          />
        ) : null}
      </View>
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
        {vehicle.imagesUrls.length > 0 ? (
          <Badge
            label={`${vehicle.imagesUrls.length} photo${vehicle.imagesUrls.length === 1 ? '' : 's'}`}
            backgroundColor={isDark ? colors.surface.muted : '#E5E7EB'}
            textColor={isDark ? colors.text.onSurfaceMuted : '#374151'}
            badgeStyle={styles.badge}
            badgeTextStyle={styles.badgeText}
          />
        ) : null}
      </View>
    </Pressable>
  );
}
