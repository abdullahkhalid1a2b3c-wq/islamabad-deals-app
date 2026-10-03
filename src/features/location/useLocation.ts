import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import { useLocationStore, ISLAMABAD_CENTER } from '../../store/location';
import { logger } from '../../lib/logger';

export function useLocation() {
  const coords = useLocationStore((state) => state.coords);
  const mode = useLocationStore((state) => state.mode);
  const selectedArea = useLocationStore((state) => state.selectedArea);
  const permission = useLocationStore((state) => state.permission);
  const isUsingFallback = useLocationStore((state) => state.isUsingFallback);

  const setGpsLocation = useLocationStore((state) => state.setGpsLocation);
  const setSelectedArea = useLocationStore((state) => state.setSelectedArea);
  const setPermission = useLocationStore((state) => state.setPermission);
  const resetToFallback = useLocationStore((state) => state.resetToFallback);

  const [requesting, setRequesting] = useState(false);

  /**
   * Requests foreground location permissions with a timeout & balanced accuracy.
   */
  const requestLocation = useCallback(async () => {
    setRequesting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setPermission('denied');
        resetToFallback();
        setRequesting(false);
        return false;
      }

      setPermission('granted');

      // Fetch location with balanced accuracy & 8s timeout
      const location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Location request timeout')), 8000),
        ),
      ]);

      if (location && 'coords' in location) {
        setGpsLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
        setRequesting(false);
        return true;
      } else {
        resetToFallback();
      }
    } catch (err) {
      logger.warn('[useLocation] Failed to get GPS coordinates, using fallback:', err);
      resetToFallback();
    } finally {
      setRequesting(false);
    }
    return false;
  }, [setGpsLocation, setPermission, resetToFallback]);

  return {
    coords,
    mode,
    selectedArea,
    permission,
    isUsingFallback,
    requesting,
    requestLocation,
    setSelectedArea,
    resetToFallback,
  };
}
