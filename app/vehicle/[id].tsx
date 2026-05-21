import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useVehicles } from '@/context/VehiclesContext';
import { colors } from '@/theme/colors';
import { formatVehicleDate } from '@/utils/formatDate';
import { STATUS_COLORS, STATUS_LABELS, TYPE_COLORS, TYPE_LABELS } from '@/utils/vehicleLabels';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PHOTO_WIDTH = SCREEN_WIDTH - 40;

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

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

export default function VehicleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { vehicles, isLoading } = useVehicles();

  const vehicle = useMemo(
    () => vehicles.find((item) => item.id === id),
    [vehicles, id],
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Registro no encontrado</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Volver al panel</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = STATUS_COLORS[vehicle.status];
  const typeStyle = TYPE_COLORS[vehicle.type];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>← Volver al panel</Text>
        </Pressable>

        <Text style={styles.title}>{vehicle.model}</Text>
        <Text style={styles.subtitle}>Detalle del vehículo</Text>

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
        </View>

        <View style={styles.card}>
          <DetailRow label="VIN" value={vehicle.vin} />
          <DetailRow label="Modelo" value={vehicle.model} />
          <DetailRow label="Tipo" value={TYPE_LABELS[vehicle.type]} />
          <DetailRow label="Estado" value={STATUS_LABELS[vehicle.status]} />
          <DetailRow label="Color" value={vehicle.color} />
          <DetailRow label="Registrado" value={formatVehicleDate(vehicle.createdAt)} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Comentarios</Text>
          <Text style={styles.comments}>
            {vehicle.comments.trim() || 'Sin comentarios registrados.'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>
            Evidencias fotográficas ({vehicle.imagesUrls.length})
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
            <Text style={styles.noPhotos}>No hay fotos adjuntas a este registro.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const PHOTO_HEIGHT = 220;

const styles = StyleSheet.create({
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
    paddingBottom: 40,
    gap: 16,
  },
  backLink: {
    alignSelf: 'flex-start',
  },
  backLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: -8,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    backgroundColor: colors.surface.elevated,
    borderRadius: 14,
    padding: 16,
    gap: 12,
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
    gap: 16,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent.primary,
  },
});
