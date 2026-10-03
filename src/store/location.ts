import { create } from 'zustand';
import { Area } from '../types/domain';

export type LocationMode = 'gps' | 'area';
export type LocationPermissionState = 'undetermined' | 'granted' | 'denied';

export interface Coordinates {
  lat: number;
  lng: number;
}

export const ISLAMABAD_CENTER: Coordinates = {
  lat: 33.6844,
  lng: 73.0479,
};

export interface LocationState {
  mode: LocationMode;
  coords: Coordinates;
  selectedArea: Area | null;
  permission: LocationPermissionState;
  isUsingFallback: boolean;

  setGpsLocation: (coords: Coordinates) => void;
  setSelectedArea: (area: Area) => void;
  setPermission: (permission: LocationPermissionState) => void;
  resetToFallback: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  mode: 'gps',
  coords: ISLAMABAD_CENTER,
  selectedArea: null,
  permission: 'undetermined',
  isUsingFallback: true,

  setGpsLocation: (coords) =>
    set({
      mode: 'gps',
      coords,
      selectedArea: null,
      isUsingFallback: false,
    }),

  setSelectedArea: (area) =>
    set({
      mode: 'area',
      coords: { lat: area.lat ?? ISLAMABAD_CENTER.lat, lng: area.lng ?? ISLAMABAD_CENTER.lng },
      selectedArea: area,
      isUsingFallback: false,
    }),

  setPermission: (permission) =>
    set((state) => ({
      permission,
      isUsingFallback: permission === 'denied' && state.mode === 'gps',
    })),

  resetToFallback: () =>
    set({
      mode: 'gps',
      coords: ISLAMABAD_CENTER,
      selectedArea: null,
      isUsingFallback: true,
    }),
}));
