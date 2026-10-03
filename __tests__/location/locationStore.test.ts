import { useLocationStore, ISLAMABAD_CENTER } from '../../src/store/location';
import { Area } from '../../src/types/domain';

describe('useLocationStore', () => {
  beforeEach(() => {
    useLocationStore.getState().resetToFallback();
  });

  it('initializes with default Islamabad fallback coordinates', () => {
    const state = useLocationStore.getState();
    expect(state.coords).toEqual(ISLAMABAD_CENTER);
    expect(state.isUsingFallback).toBe(true);
    expect(state.mode).toBe('gps');
  });

  it('updates state when GPS location is set', () => {
    const newCoords = { lat: 33.7294, lng: 73.0747 };
    useLocationStore.getState().setGpsLocation(newCoords);

    const state = useLocationStore.getState();
    expect(state.coords).toEqual(newCoords);
    expect(state.mode).toBe('gps');
    expect(state.isUsingFallback).toBe(false);
  });

  it('updates state when Area is selected', () => {
    const testArea: Area = {
      id: 'a1',
      name: 'F-7 Markaz',
      city: 'Islamabad',
      slug: 'f-7',
      lat: 33.7215,
      lng: 73.0588,
    };

    useLocationStore.getState().setSelectedArea(testArea);

    const state = useLocationStore.getState();
    expect(state.mode).toBe('area');
    expect(state.selectedArea?.name).toBe('F-7 Markaz');
    expect(state.coords.lat).toBe(33.7215);
    expect(state.isUsingFallback).toBe(false);
  });

  it('falls back cleanly on permission denial', () => {
    useLocationStore.getState().setPermission('denied');
    const state = useLocationStore.getState();
    expect(state.permission).toBe('denied');
    expect(state.isUsingFallback).toBe(true);
  });
});
