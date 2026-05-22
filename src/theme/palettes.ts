/**
 * Fine Shine palettes — dark (default brand) and light mode.
 */
export const darkPalette = {
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

export const lightPalette = {
  background: {
    primary: '#F4F4F5',
    secondary: '#FFFFFF',
  },
  surface: {
    default: '#FFFFFF',
    elevated: '#FFFFFF',
    muted: '#E8E8E8',
  },
  text: {
    primary: '#111111',
    secondary: '#5C5C5C',
    mutedOnDark: '#6B6B6B',
    onSurface: '#1A1A1A',
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
    default: '#E0E0E0',
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

export type AppColors = {
  readonly [K in keyof typeof darkPalette]: {
    readonly [P in keyof (typeof darkPalette)[K]]: string;
  };
};

export type ColorScheme = 'light' | 'dark';

export function getPalette(scheme: ColorScheme): AppColors {
  return scheme === 'dark' ? darkPalette : lightPalette;
}
