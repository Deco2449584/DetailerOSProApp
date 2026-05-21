import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Vehicle } from '@/types';
import { colors } from '@/theme/colors';
import { formatVehicleDate } from '@/utils/formatDate';
import { STATUS_COLORS, STATUS_LABELS, TYPE_COLORS, TYPE_LABELS } from '@/utils/vehicleLabels';

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
  const statusStyle = STATUS_COLORS[vehicle.status];
  const typeStyle = TYPE_COLORS[vehicle.type];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.main}>
        <Text style={styles.model}>{vehicle.model}</Text>
        <Text style={styles.vin}>VIN: {vehicle.vin}</Text>
        <View style={styles.badges}>
          <Badge
            label={STATUS_LABELS[vehicle.status]}
            backgroundColor={statusStyle.bg}
            textColor={statusStyle.text}
          />
          <Badge
            label={TYPE_LABELS[vehicle.type]}
            backgroundColor={typeStyle.bg}
            textColor={typeStyle.text}
          />
          {vehicle.imagesUrls.length > 0 ? (
            <Badge
              label={`${vehicle.imagesUrls.length} foto${vehicle.imagesUrls.length === 1 ? '' : 's'}`}
              backgroundColor="#E5E7EB"
              textColor="#374151"
            />
          ) : null}
        </View>
      </View>
      <View style={styles.trailing}>
        <Text style={styles.date}>{formatVehicleDate(vehicle.createdAt)}</Text>
        {onPress ? <Text style={styles.chevron}>›</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface.elevated,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
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
  main: {
    flex: 1,
    gap: 4,
  },
  model: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.onSurface,
  },
  vin: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.text.onSurfaceMuted,
    letterSpacing: 0.3,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
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
  trailing: {
    alignItems: 'flex-end',
    gap: 6,
    marginLeft: 12,
  },
  date: {
    fontSize: 11,
    color: colors.text.onSurfaceMuted,
    textAlign: 'right',
    minWidth: 72,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text.onSurfaceMuted,
    lineHeight: 24,
  },
});
