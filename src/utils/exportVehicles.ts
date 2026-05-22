import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import type { Vehicle } from '@/types';
import { formatVehicleDate } from '@/utils/formatDate';
import { STATUS_LABELS, TYPE_LABELS } from '@/utils/vehicleLabels';

const CSV_HEADERS = [
  'ID',
  'VIN',
  'Model',
  'Type',
  'Status',
  'Colour',
  'Comments',
  'Photos',
  'Operator',
  'Created',
] as const;

function escapeCsvCell(value: string): string {
  const normalized = value.replace(/"/g, '""');
  return `"${normalized}"`;
}

function vehicleToRow(vehicle: Vehicle): string[] {
  return [
    vehicle.id,
    vehicle.vin,
    vehicle.model,
    TYPE_LABELS[vehicle.type],
    STATUS_LABELS[vehicle.status],
    vehicle.color,
    vehicle.comments,
    String(vehicle.imagesUrls.length),
    vehicle.createdByEmail || vehicle.userId,
    formatVehicleDate(vehicle.createdAt),
  ];
}

export function vehiclesToCsv(vehicles: Vehicle[]): string {
  const header = CSV_HEADERS.map(escapeCsvCell).join(',');
  const rows = vehicles.map((vehicle) =>
    vehicleToRow(vehicle).map(escapeCsvCell).join(','),
  );
  return `\uFEFF${[header, ...rows].join('\n')}`;
}

async function writeAndShare(content: string, filename: string, mimeType: string): Promise<void> {
  const fileUri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType,
    dialogTitle: 'Export vehicle records',
    UTI: mimeType,
  });
}

export async function shareVehiclesAsCsv(vehicles: Vehicle[]): Promise<void> {
  const timestamp = new Date().toISOString().slice(0, 10);
  await writeAndShare(
    vehiclesToCsv(vehicles),
    `fineshine-records-${timestamp}.csv`,
    'text/csv',
  );
}

/** Excel opens UTF-8 CSV saved with .xls extension on mobile share sheets. */
export async function shareVehiclesAsExcel(vehicles: Vehicle[]): Promise<void> {
  const timestamp = new Date().toISOString().slice(0, 10);
  await writeAndShare(
    vehiclesToCsv(vehicles),
    `fineshine-records-${timestamp}.xls`,
    'application/vnd.ms-excel',
  );
}
