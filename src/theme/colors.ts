/**
 * Fine Shine palette — https://fineshine.com.au/
 * Corporate black, action red (#e21f28), and light surfaces.
 */
export const colors = {
  background: {
    primary: '#000000',
    secondary: '#141414',
  },
  surface: {
    default: '#F3F3F3',
    elevated: '#FFFFFF',
    muted: '#E8E8E8',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B8B8B8',
    mutedOnDark: '#A0A0A0',
    onSurface: '#3D3D3D',
    onSurfaceMuted: '#6B6B6B',
    onAccent: '#FFFFFF',
  },
  accent: {
    primary: '#E21F28',
    primaryPressed: '#B81820',
    secondary: '#000000',
    secondaryPressed: '#2A2A2A',
  },
  border: {
    default: '#333333',
    onSurface: '#D1D5DB',
    brand: '#000000',
  },
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#E21F28',
    info: '#3B82F6',
  },
} as const;

export type Colors = typeof colors;
