/**
 * Formats distance in meters to a readable string e.g. 450 -> "450 m", 2300 -> "2.3 km".
 */
export function formatDistance(meters?: number | null): string {
  if (meters === undefined || meters === null || isNaN(meters) || meters < 0) {
    return '0 m';
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  const km = meters / 1000;
  const formattedKm = km >= 10 ? Math.round(km).toString() : km.toFixed(1);
  return `${formattedKm} km`;
}
