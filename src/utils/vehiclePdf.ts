import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { brand } from '@/theme/brand';
import type { Vehicle } from '@/types';
import { formatVehicleDate } from '@/utils/formatDate';
import { STATUS_LABELS, TYPE_LABELS } from '@/utils/vehicleLabels';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildVehicleHtml(vehicle: Vehicle): string {
  const photoItems =
    vehicle.imagesUrls.length > 0
      ? vehicle.imagesUrls
          .map(
            (url, index) =>
              `<div class="photo"><img src="${escapeHtml(url)}" alt="Photo ${index + 1}" /><span>Photo ${index + 1}</span></div>`,
          )
          .join('')
      : '<p class="muted">No photos attached.</p>';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Helvetica, Arial, sans-serif; color: #111; padding: 24px; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .subtitle { color: #666; font-size: 13px; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px; margin-bottom: 20px; }
    .field label { display: block; font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 0.5px; }
    .field span { display: block; font-size: 14px; font-weight: 600; margin-top: 2px; }
    .comments { background: #f4f4f5; border-radius: 8px; padding: 12px; margin-bottom: 20px; }
    .photos { display: flex; flex-wrap: wrap; gap: 12px; }
    .photo { width: 160px; text-align: center; }
    .photo img { width: 160px; height: 120px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; }
    .photo span { display: block; font-size: 11px; color: #666; margin-top: 4px; }
    .muted { color: #888; font-style: italic; }
    .footer { margin-top: 28px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 12px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(vehicle.model)}</h1>
  <p class="subtitle">${escapeHtml(brand.name)} · Vehicle inspection report</p>
  <div class="grid">
    <div class="field"><label>VIN</label><span>${escapeHtml(vehicle.vin)}</span></div>
    <div class="field"><label>Model</label><span>${escapeHtml(vehicle.model)}</span></div>
    <div class="field"><label>Type</label><span>${escapeHtml(TYPE_LABELS[vehicle.type])}</span></div>
    <div class="field"><label>Status</label><span>${escapeHtml(STATUS_LABELS[vehicle.status])}</span></div>
    <div class="field"><label>Colour</label><span>${escapeHtml(vehicle.color)}</span></div>
    <div class="field"><label>Registered</label><span>${escapeHtml(formatVehicleDate(vehicle.createdAt))}</span></div>
    <div class="field"><label>Operator</label><span>${escapeHtml(vehicle.createdByEmail || '—')}</span></div>
    <div class="field"><label>Record ID</label><span>${escapeHtml(vehicle.id)}</span></div>
  </div>
  <div class="comments">
    <label style="font-size:10px;text-transform:uppercase;color:#888;">Comments</label>
    <p style="margin:6px 0 0;font-size:14px;">${escapeHtml(vehicle.comments.trim() || 'No comments recorded.')}</p>
  </div>
  <h2 style="font-size:16px;margin:0 0 12px;">Photo evidence (${vehicle.imagesUrls.length})</h2>
  <div class="photos">${photoItems}</div>
  <p class="footer">${escapeHtml(brand.license)} · Generated ${escapeHtml(new Date().toLocaleString())}</p>
</body>
</html>`;
}

export async function shareVehiclePdf(vehicle: Vehicle): Promise<void> {
  const { uri } = await Print.printToFileAsync({
    html: buildVehicleHtml(vehicle),
    base64: false,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: `Report ${vehicle.vin}`,
    UTI: 'com.adobe.pdf',
  });
}
