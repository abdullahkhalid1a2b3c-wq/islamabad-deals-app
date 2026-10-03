import { useQuery } from '@tanstack/react-query';
import { dealsService, categoriesService, DealsFilter } from '../../services/api';
import { supabase } from '../../lib/supabase';
import { Coordinates } from '../../store/location';

export function useHomeFeed(coords?: Coordinates) {
  // Round coordinates to 3 decimal places (~100m) to prevent refetching on minor GPS jitter
  const stableLat = coords ? Math.round(coords.lat * 1000) / 1000 : 33.7294;
  const stableLng = coords ? Math.round(coords.lng * 1000) / 1000 : 73.0747;
  const queryKey = ['deals', 'home_feed', `${stableLat},${stableLng}`];

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_home_feed', {
          p_lat: stableLat,
          p_lng: stableLng,
        });
        if (!error && data) {
          // Dynamic JSON returned from Supabase get_home_feed RPC function
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return data as any;
        }
      } catch (err) {
        // Fallback to individual service calls
      }

      const [featured, nearby, expiring_soon, new_deals, popular_restaurants] = await Promise.all([
        dealsService.getFeaturedDeals(),
        dealsService.getNearbyDeals(),
        dealsService.getExpiringDeals(),
        dealsService.getNewDeals(),
        dealsService.getDeals(),
      ]);

      return {
        featured,
        nearby,
        expiring_soon,
        new: new_deals,
        popular_restaurants,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
  });
}

export function useFeaturedDeals() {
  return useQuery({
    queryKey: ['deals', 'featured'],
    queryFn: () => dealsService.getFeaturedDeals(),
  });
}

export function useDealsNearby() {
  return useQuery({
    queryKey: ['deals', 'nearby'],
    queryFn: () => dealsService.getNearbyDeals(),
  });
}

export function useExpiringDeals() {
  return useQuery({
    queryKey: ['deals', 'expiring'],
    queryFn: () => dealsService.getExpiringDeals(),
  });
}

export function useNewDeals() {
  return useQuery({
    queryKey: ['deals', 'new'],
    queryFn: () => dealsService.getNewDeals(),
  });
}

export function useDeals(filter?: DealsFilter) {
  return useQuery({
    queryKey: ['deals', filter],
    queryFn: () => dealsService.getDeals(filter),
  });
}

export function useDealDetail(id: string) {
  return useQuery({
    queryKey: ['deals', 'detail', id],
    queryFn: () => dealsService.getDealById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDeal(id: string) {
  return useDealDetail(id);
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getCategories(),
  });
}
