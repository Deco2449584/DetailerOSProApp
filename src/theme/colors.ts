/**
 * Paleta corporativa — app industrial / automotriz (Detaileros Pro).
 * Fondos oscuros, superficies claras y acento de alta visibilidad para CTAs.
 */
export const colors = {
  background: {
    primary: '#1A1D23',
    secondary: '#252A33',
  },
  surface: {
    default: '#F4F6F8',
    elevated: '#FFFFFF',
    muted: '#E2E6EB',
  },
  text: {
    primary: '#F4F6F8',
    secondary: '#9CA3AF',
    onSurface: '#1A1D23',
    onSurfaceMuted: '#6B7280',
  },
  accent: {
    primary: '#00B4FF',
    primaryPressed: '#0090CC',
    secondary: '#22C55E',
    secondaryPressed: '#16A34A',
  },
  border: {
    default: '#374151',
    onSurface: '#D1D5DB',
  },
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
} as const;

export type Colors = typeof colors;
