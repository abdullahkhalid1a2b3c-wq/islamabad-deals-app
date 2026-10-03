import { create } from 'zustand';

export type RestaurantSortOption = 'popular' | 'nearest' | 'top_rated' | 'newest';

export interface ExploreFiltersState {
  categorySlug: string | null;
  areaId: string | null;
  priceRange: number | null;
  openNow: boolean;
  sort: RestaurantSortOption;

  setCategorySlug: (slug: string | null) => void;
  setAreaId: (areaId: string | null) => void;
  setPriceRange: (price: number | null) => void;
  setOpenNow: (openNow: boolean) => void;
  setSort: (sort: RestaurantSortOption) => void;
  resetFilters: () => void;
  getActiveFilterCount: () => number;
}

const DEFAULT_FILTERS = {
  categorySlug: null as string | null,
  areaId: null as string | null,
  priceRange: null as number | null,
  openNow: false,
  sort: 'popular' as RestaurantSortOption,
};

export const useExploreFiltersStore = create<ExploreFiltersState>((set, get) => ({
  ...DEFAULT_FILTERS,

  setCategorySlug: (categorySlug) => set({ categorySlug }),
  setAreaId: (areaId) => set({ areaId }),
  setPriceRange: (priceRange) => set({ priceRange }),
  setOpenNow: (openNow) => set({ openNow }),
  setSort: (sort) => set({ sort }),

  resetFilters: () => set(DEFAULT_FILTERS),

  getActiveFilterCount: () => {
    const { categorySlug, areaId, priceRange, openNow, sort } = get();
    let count = 0;
    if (categorySlug && categorySlug !== 'all') count++;
    if (areaId) count++;
    if (priceRange !== null) count++;
    if (openNow) count++;
    if (sort !== 'popular') count++;
    return count;
  },
}));
