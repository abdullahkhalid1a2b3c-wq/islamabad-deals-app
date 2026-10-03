export const radii = {
  card: 16,
  button: 14,
  chip: 999,
  sm: 8,
  md: 12,
  full: 9999,
} as const;

export type Radii = typeof radii;
