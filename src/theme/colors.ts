export const colors = {
  primary: '#FF5A1F',
  primaryDark: '#E04A14',
  accent: '#FFB400',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#F59E0B',
  background: '#FAF7F2',
  surface: '#FFFFFF',
  text: '#1B1B1F',
  textMuted: '#6B7280',
  border: '#EDE7DD',
  overlay: 'rgba(0, 0, 0, 0.45)',
} as const;

export type Colors = typeof colors;
