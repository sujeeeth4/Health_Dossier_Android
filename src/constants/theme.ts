import { Platform } from 'react-native';

export const colors = {
  background: '#17271f',
  backgroundRaised: '#1c2c25',
  surface: '#24362e',
  surfaceSoft: '#2b3d31',
  sage: '#304431',
  warm: '#3a3e30',
  text: '#eef0e7',
  muted: '#adb5aa',
  line: '#3c4d43',
  green: '#9dc99c',
  greenStrong: '#b4d9af',
  blue: '#9ec7d7',
  error: '#efac99',
  blackGreen: '#203428',
  white: '#ffffff',
} as const;

export const fonts = {
  sans: Platform.select({ ios: 'Avenir Next', android: 'sans-serif', default: 'System' }),
  sansMedium: Platform.select({ ios: 'Avenir Next Demi Bold', android: 'sans-serif-medium', default: 'System' }),
  serif: Platform.select({ ios: 'Iowan Old Style', android: 'serif', default: 'serif' }),
} as const;

export const layout = { gutter: 20, radius: 14, maxWidth: 760 } as const;
