import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

type EvidencePhotosFieldProps = {
  photos: string[];
  onChange: (photos: string[]) => void;
};

async function ensureCameraPermission(): Promise<boolean> {
  const current = await ImagePicker.getCameraPermissionsAsync();
  if (current.granted) return true;

  const requested = await ImagePicker.requestCameraPermissionsAsync();
  if (!requested.granted) {
    Alert.alert(
      'Permiso de cámara',
      'Necesitamos acceso a la cámara para tomar evidencias fotográficas.',
    );
    return false;
  }
  return true;
}

async function ensureLibraryPermission(): Promise<boolean> {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted) return true;

  const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!requested.granted) {
    Alert.alert(
      'Permiso de galería',
      'Necesitamos acceso a la galería para seleccionar evidencias fotográficas.',
    );
    return false;
  }
  return true;
}

export function EvidencePhotosField({ photos, onChange }: EvidencePhotosFieldProps) {
  const appendPhotos = (uris: string[]) => {
    if (uris.length === 0) return;
    onChange([...photos, ...uris]);
  };

  const handleTakePhoto = async () => {
    const allowed = await ensureCameraPermission();
    if (!allowed) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      appendPhotos([result.assets[0].uri]);
    }
  };

  const handlePickFromGallery = async () => {
    const allowed = await ensureLibraryPermission();
    if (!allowed) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.8,
    });

    if (!result.canceled) {
      appendPhotos(result.assets.map((asset) => asset.uri).filter(Boolean));
    }
  };

  const handleRemove = (uri: string) => {
    onChange(photos.filter((item) => item !== uri));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Evidencias fotográficas</Text>
      <Text style={styles.hint}>Toma o selecciona fotos del estado del vehículo</Text>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          onPress={handleTakePhoto}>
          <Text style={styles.actionButtonText}>Tomar foto</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionButtonSecondary,
            pressed && styles.actionButtonPressed,
          ]}
          onPress={handlePickFromGallery}>
          <Text style={styles.actionButtonTextSecondary}>Galería</Text>
        </Pressable>
      </View>

      {photos.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnails}>
          {photos.map((uri) => (
            <View key={uri} style={styles.thumbnailWrap}>
              <Image source={{ uri }} style={styles.thumbnail} contentFit="cover" />
              <Pressable style={styles.removeBtn} onPress={() => handleRemove(uri)}>
                <Text style={styles.removeBtnText}>×</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.empty}>Sin fotos aún</Text>
      )}
    </View>
  );
}

const THUMB_SIZE = 88;

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.onSurface,
  },
  hint: {
    fontSize: 12,
    color: colors.text.onSurfaceMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.accent.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.onSurface,
  },
  actionButtonPressed: {
    opacity: 0.75,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.onSurface,
  },
  actionButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.onSurface,
  },
  thumbnails: {
    gap: 10,
    paddingVertical: 4,
  },
  thumbnailWrap: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  empty: {
    fontSize: 13,
    color: colors.text.onSurfaceMuted,
    fontStyle: 'italic',
  },
});
