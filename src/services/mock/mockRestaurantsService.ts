import { RestaurantsService, ListRestaurantsParams, ListRestaurantsResult } from '../api/types';
import { Restaurant, RestaurantSummary } from '../../types/domain';
import { MOCK_RESTAURANTS } from './mockData';
import { env } from '../../lib/env';

function simulateLatency<T>(data: T): Promise<T> {
  const ms = Math.floor(Math.random() * 300) + 300;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (env.EXPO_PUBLIC_DEBUG_ERRORS && Math.random() < 0.25) {
        reject(new Error('[Simulated Network Error] Failed to fetch restaurants.'));
      } else {
        resolve(data);
      }
    }, ms);
  });
}

export const mockRestaurantsService: RestaurantsService = {
  async getPopularRestaurants(): Promise<RestaurantSummary[]> {
    const sorted = [...MOCK_RESTAURANTS].sort((a, b) => b.rating - a.rating);
    return simulateLatency(sorted);
  },

  async getRestaurants(searchQuery?: string): Promise<RestaurantSummary[]> {
    if (!searchQuery) {
      return simulateLatency(MOCK_RESTAURANTS);
    }
    const q = searchQuery.toLowerCase();
    const filtered = MOCK_RESTAURANTS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.areaName.toLowerCase().includes(q) ||
        r.cuisine.some((c) => c.toLowerCase().includes(q)),
    );
    return simulateLatency(filtered);
  },

  async listRestaurants(params: ListRestaurantsParams): Promise<ListRestaurantsResult> {
    let list = [...MOCK_RESTAURANTS];
    if (params.categorySlug && params.categorySlug !== 'all') {
      const slug = params.categorySlug.toLowerCase();
      list = list.filter((r) => r.cuisine.some((c) => c.toLowerCase().includes(slug)));
    }
    if (params.priceRange) {
      list = list.filter((r) => r.priceRange === params.priceRange);
    }
    const limit = params.limit || 15;
    const offset = params.offset || 0;
    const sliced = list.slice(offset, offset + limit);
    const nextOffset = offset + limit < list.length ? offset + limit : null;
    return simulateLatency({ items: sliced, nextOffset });
  },

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    const found = MOCK_RESTAURANTS.find((r) => r.id === id) || null;
    return simulateLatency(found);
  },
};
