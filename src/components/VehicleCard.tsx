import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useVehicleCatalog } from '@/context/VehicleCatalogContext';
import type { Vehicle } from '@/types';
import { colors } from '@/theme/colors';
import { formatVehicleDate } from '@/utils/formatDate';
import { getTypeColor, STATUS_COLORS, STATUS_LABELS } from '@/utils/vehicleLabels';

type VehicleCardProps = {
  vehicle: Vehicle;
  onPress?: () => void;
};

function Badge({
  label,
  backgroundColor,
  textColor,
}: {
  label: string;
  backgroundColor: string;
  textColor: string;
}) {
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export function VehicleCard({ vehicle, onPress }: VehicleCardProps) {
  const { getTypeLabel } = useVehicleCatalog();
  const statusStyle = STATUS_COLORS[vehicle.status];
  const typeStyle = getTypeColor(vehicle.type);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.model} numberOfLines={1}>
            {vehicle.model}
          </Text>
          <Text style={styles.vin}>VIN: {vehicle.vin}</Text>
          <Text style={styles.date}>{formatVehicleDate(vehicle.createdAt)}</Text>
        </View>
        {onPress ? (
          <Ionicons name="chevron-forward" size={20} color={colors.text.onSurfaceMuted} />
        ) : null}
      </View>
      <View style={styles.badges}>
        <Badge
          label={STATUS_LABELS[vehicle.status]}
          backgroundColor={statusStyle.bg}
          textColor={statusStyle.text}
        />
        <Badge
          label={getTypeLabel(vehicle.type)}
          backgroundColor={typeStyle.bg}
          textColor={typeStyle.text}
        />
        {vehicle.imagesUrls.length > 0 ? (
          <Badge
            label={`${vehicle.imagesUrls.length} photo${vehicle.imagesUrls.length === 1 ? '' : 's'}`}
            backgroundColor="#E5E7EB"
            textColor="#374151"
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.elevated,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
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
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
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
