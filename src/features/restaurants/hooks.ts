import { useQuery } from '@tanstack/react-query';
import { restaurantsService } from '../../services/api';

export function usePopularRestaurants() {
  return useQuery({
    queryKey: ['restaurants', 'popular'],
    queryFn: () => restaurantsService.getPopularRestaurants(),
  });
}

export function useRestaurants(searchQuery?: string) {
  return useQuery({
    queryKey: ['restaurants', 'list', searchQuery],
    queryFn: () => restaurantsService.getRestaurants(searchQuery),
  });
}

export function useRestaurantDetail(id: string) {
  return useQuery({
    queryKey: ['restaurants', 'detail', id],
    queryFn: () => restaurantsService.getRestaurantById(id),
    enabled: !!id,
  });
}
