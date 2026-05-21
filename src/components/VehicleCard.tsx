import { StyleSheet, Text, View } from 'react-native';

import type { Vehicle, VehicleStatus, VehicleType } from '@/types';
import { colors } from '@/theme/colors';
import { formatVehicleDate } from '@/utils/formatDate';

type VehicleCardProps = {
  vehicle: Vehicle;
};

const STATUS_LABELS: Record<VehicleStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  completado: 'Completado',
  entregado: 'Entregado',
};

const TYPE_LABELS: Record<VehicleType, string> = {
  nuevo: 'Nuevo',
  usado: 'Usado',
  redetailing: 'Redetailing',
};

const STATUS_COLORS: Record<VehicleStatus, { bg: string; text: string }> = {
  pendiente: { bg: '#FEF3C7', text: '#92400E' },
  en_proceso: { bg: '#DBEAFE', text: '#1E40AF' },
  completado: { bg: '#D1FAE5', text: '#065F46' },
  entregado: { bg: '#E5E7EB', text: '#374151' },
};

const TYPE_COLORS: Record<VehicleType, { bg: string; text: string }> = {
  nuevo: { bg: '#E0F2FE', text: '#0369A1' },
  usado: { bg: '#F3E8FF', text: '#6B21A8' },
  redetailing: { bg: '#FFEDD5', text: '#9A3412' },
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

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const statusStyle = STATUS_COLORS[vehicle.status];
  const typeStyle = TYPE_COLORS[vehicle.type];

  return (
    <View style={styles.card}>
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
      <Text style={styles.date}>{formatVehicleDate(vehicle.createdAt)}</Text>
    </View>
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
  date: {
    fontSize: 11,
    color: colors.text.onSurfaceMuted,
    marginLeft: 12,
    textAlign: 'right',
    minWidth: 72,
  },
});
