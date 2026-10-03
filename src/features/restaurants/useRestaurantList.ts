import { useInfiniteQuery } from '@tanstack/react-query';
import { restaurantsService, ListRestaurantsParams } from '../../services/api';
import { Coordinates } from '../../store/location';
import { RestaurantSortOption } from '../../store/exploreFilters';

export interface UseRestaurantListOptions {
  coords?: Coordinates;
  categorySlug?: string | null;
  areaId?: string | null;
  priceRange?: number | null;
  openNow?: boolean;
  sort?: RestaurantSortOption;
  searchQuery?: string;
}

export function useRestaurantList(options: UseRestaurantListOptions = {}) {
  const { coords, categorySlug, areaId, priceRange, openNow, sort = 'popular', searchQuery } = options;

  // Round coordinates to 3 decimals to avoid query key invalidation on minor GPS jitter
  const stableLat = coords ? Math.round(coords.lat * 1000) / 1000 : 33.7294;
  const stableLng = coords ? Math.round(coords.lng * 1000) / 1000 : 73.0747;

  const queryKey = [
    'restaurants',
    'list',
    `${stableLat},${stableLng}`,
    categorySlug || 'all',
    areaId || 'all_areas',
    priceRange !== null ? priceRange : 'all_prices',
    openNow ? 'open_only' : 'all_hours',
    sort,
    searchQuery || '',
  ];

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      const params: ListRestaurantsParams = {
        coords: { lat: stableLat, lng: stableLng },
        categorySlug,
        areaId,
        priceRange,
        openNow,
        sort,
        searchQuery,
        limit: 15,
        offset: pageParam as number,
      };
      return restaurantsService.listRestaurants(params);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}
