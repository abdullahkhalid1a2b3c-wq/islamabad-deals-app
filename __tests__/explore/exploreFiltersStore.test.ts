import { useExploreFiltersStore } from '../../src/store/exploreFilters';

describe('useExploreFiltersStore', () => {
  beforeEach(() => {
    useExploreFiltersStore.getState().resetFilters();
  });

  it('initializes with default filters', () => {
    const state = useExploreFiltersStore.getState();
    expect(state.categorySlug).toBeNull();
    expect(state.areaId).toBeNull();
    expect(state.priceRange).toBeNull();
    expect(state.openNow).toBe(false);
    expect(state.sort).toBe('popular');
    expect(state.getActiveFilterCount()).toBe(0);
  });

  it('updates category filter and active count', () => {
    useExploreFiltersStore.getState().setCategorySlug('cafes');
    const state = useExploreFiltersStore.getState();
    expect(state.categorySlug).toBe('cafes');
    expect(state.getActiveFilterCount()).toBe(1);
  });

  it('resets filters cleanly', () => {
    useExploreFiltersStore.getState().setCategorySlug('cafes');
    useExploreFiltersStore.getState().setOpenNow(true);
    useExploreFiltersStore.getState().setPriceRange(3);
    expect(useExploreFiltersStore.getState().getActiveFilterCount()).toBe(3);

    useExploreFiltersStore.getState().resetFilters();
    expect(useExploreFiltersStore.getState().getActiveFilterCount()).toBe(0);
  });
});
