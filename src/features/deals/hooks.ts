import { useQuery } from '@tanstack/react-query';
import { dealsService, categoriesService, DealsFilter } from '../../services/api';

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
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getCategories(),
  });
}
