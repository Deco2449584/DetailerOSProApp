import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EvidencePhotosField } from '@/components/EvidencePhotosField';
import { OptionGroup } from '@/components/OptionGroup';
import { useVehicles } from '@/context/VehiclesContext';
import {
  TESLA_COLORS,
  TESLA_MODELS,
  type TeslaColor,
  type TeslaModel,
  type VehicleType,
} from '@/types';
import { brand } from '@/theme/brand';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { TYPE_LABELS } from '@/utils/vehicleLabels';

const VEHICLE_TYPES = ['nuevo', 'usado', 'redetailing'] as const;

export default function ScannerScreen() {
  const router = useRouter();
  const { addVehicle } = useVehicles();
  const [permission, requestPermission] = useCameraPermissions();

  const [isScanning, setIsScanning] = useState(true);
  const [scannedVin, setScannedVin] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [model, setModel] = useState<TeslaModel>('Model 3');
  const [type, setType] = useState<VehicleType>('nuevo');
  const [vehicleColor, setVehicleColor] = useState<TeslaColor>('Pearl White Multi-Coat');
  const [comments, setComments] = useState('');
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarcodeScanned = useCallback(
    ({ data }: BarcodeScanningResult) => {
      if (!isScanning || !data) return;
      setScannedVin(data.trim());
      setIsScanning(false);
    },
    [isScanning],
  );

  const handleScanAgain = () => {
    setScannedVin(null);
    setIsScanning(true);
    setModel('Model 3');
    setType('nuevo');
    setVehicleColor('Pearl White Multi-Coat');
    setComments('');
    setEvidencePhotos([]);
  };

  const handleSave = async () => {
    if (!scannedVin?.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await addVehicle({
        vin: scannedVin.trim(),
        model,
        type,
        color: vehicleColor,
        comments,
        imagesUrls: evidencePhotos,
      });
      router.replace('/(tabs)' as Href);
    } catch {
      Alert.alert('Error', 'Could not save the record. Please try again.');
      setIsSaving(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionTitle}>Camera permission required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan the vehicle VIN QR code.
          </Text>
          <Pressable style={styles.primaryButton} onPress={requestPermission}>
            <Text style={styles.primaryButtonText}>Grant permission</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const showForm = !isScanning && scannedVin !== null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {isScanning ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarcodeScanned}
          />
          <View style={styles.overlay}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
            <Text style={styles.scanTitle}>Scan VIN (QR)</Text>
            <Text style={styles.scanHint}>
              {brand.name} · Point at the vehicle QR code
            </Text>
            <View style={styles.frameContainer}>
              <View style={styles.frame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
            </View>
          </View>
        </View>
      ) : showForm ? (
        <ScrollView
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Pressable style={styles.backButtonForm} onPress={() => router.back()}>
            <Text style={styles.backButtonFormText}>← Back to panel</Text>
          </Pressable>

          <Text style={styles.formTitle}>Vehicle inspection</Text>

          <View style={styles.vinBox}>
            <Text style={styles.vinLabel}>Scanned VIN</Text>
            <TextInput
              style={styles.vinInput}
              value={scannedVin}
              editable={false}
              selectTextOnFocus
            />
          </View>

          <View style={styles.formCard}>
            <OptionGroup label="Model" options={TESLA_MODELS} value={model} onChange={setModel} />

            <OptionGroup
              label="Type"
              options={VEHICLE_TYPES}
              value={type}
              onChange={setType}
              getLabel={(option) => TYPE_LABELS[option]}
            />

            <OptionGroup
              label="Official Tesla colour"
              options={TESLA_COLORS}
              value={vehicleColor}
              onChange={setVehicleColor}
            />

            <View style={styles.field}>
              <Text style={styles.fieldLabelDark}>Comments</Text>
            <TextInput
              style={styles.commentsInput}
              value={comments}
              onChangeText={setComments}
              placeholder="Inspection notes..."
              placeholderTextColor={colors.text.onSurfaceMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            </View>

            <EvidencePhotosField photos={evidencePhotos} onChange={setEvidencePhotos} />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || isSaving) && styles.primaryButtonPressed,
              isSaving && styles.primaryButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator color={colors.text.onAccent} />
            ) : (
              <Text style={styles.primaryButtonText}>Save & Continue</Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed,
            ]}
            onPress={handleScanAgain}>
            <Text style={styles.secondaryButtonText}>Scan again</Text>
          </Pressable>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const FRAME_SIZE = 260;
const CORNER_SIZE = 28;
const CORNER_WIDTH = 4;

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
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 16,
  },
  backButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  scanTitle: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.text.primary,
    marginBottom: 8,
  },
  scanHint: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: colors.accent.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
  },
  permissionBox: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  backButtonForm: {
    alignSelf: 'flex-start',
  },
  backButtonFormText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent.primary,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  vinBox: {
    gap: 6,
  },
  vinLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vinInput: {
    backgroundColor: colors.surface.elevated,
    borderWidth: 2,
    borderColor: colors.accent.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: colors.text.onSurface,
  },
  field: {
    gap: 8,
  },
  formCard: {
    backgroundColor: colors.surface.elevated,
    borderRadius: 16,
    padding: 16,
    gap: 20,
  },
  fieldLabelDark: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.onSurface,
  },
  commentsInput: {
    backgroundColor: colors.surface.elevated,
    borderWidth: 1,
    borderColor: colors.border.onSurface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text.onSurface,
    minHeight: 100,
  },
  primaryButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonPressed: {
    backgroundColor: colors.accent.primaryPressed,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 16,
    color: colors.text.onAccent,
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  secondaryButtonPressed: {
    opacity: 0.7,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
  },
});
