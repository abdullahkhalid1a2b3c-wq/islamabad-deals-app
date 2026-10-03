import { DealsService, DealsFilter } from '../api/types';
import { Deal, DealSummary } from '../../types/domain';
import { MOCK_DEALS } from './mockData';
import { env } from '../../lib/env';
import { getDealExpiry } from '../../utils/dealStatus';

function simulateLatency<T>(data: T): Promise<T> {
  const ms = Math.floor(Math.random() * 300) + 300; // 300 to 600 ms
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (env.EXPO_PUBLIC_DEBUG_ERRORS && Math.random() < 0.25) {
        reject(new Error('[Simulated Network Error] Failed to fetch deals.'));
      } else {
        resolve(data);
      }
    }, ms);
  });
}

export const mockDealsService: DealsService = {
  async getFeaturedDeals(): Promise<DealSummary[]> {
    const featured = MOCK_DEALS.filter((d) => d.isFeatured);
    return simulateLatency(featured);
  },

  async getNearbyDeals(): Promise<DealSummary[]> {
    const sortedByDistance = [...MOCK_DEALS].sort(
      (a, b) => (a.restaurant.distanceM || 9999) - (b.restaurant.distanceM || 9999),
    );
    return simulateLatency(sortedByDistance.slice(0, 10));
  },

  async getExpiringDeals(): Promise<DealSummary[]> {
    const expiring = MOCK_DEALS.filter((d) => {
      const exp = getDealExpiry(d);
      return exp.state === 'ending_soon' || exp.state === 'ending_today';
    });
    return simulateLatency(expiring.length > 0 ? expiring : MOCK_DEALS.slice(0, 5));
  },

  async getNewDeals(): Promise<DealSummary[]> {
    const newDeals = MOCK_DEALS.filter(
      (d) =>
        d.id.startsWith('deal-19') ||
        d.id.startsWith('deal-20') ||
        d.id.startsWith('deal-21') ||
        d.id.startsWith('deal-22'),
    );
    return simulateLatency(newDeals.length > 0 ? newDeals : MOCK_DEALS.slice(5, 10));
  },

  async getDeals(filter?: DealsFilter): Promise<DealSummary[]> {
    let result = [...MOCK_DEALS];

    if (filter?.categorySlug) {
      // Filter deals by category slug mapping
      if (filter.categorySlug === 'burgers') {
        result = result.filter((d) => d.title.toLowerCase().includes('burger'));
      } else if (filter.categorySlug === 'pizza') {
        result = result.filter((d) => d.title.toLowerCase().includes('pizza'));
      } else if (filter.categorySlug === 'desi') {
        result = result.filter(
          (d) =>
            d.title.toLowerCase().includes('biryani') ||
            d.title.toLowerCase().includes('karahi') ||
            d.title.toLowerCase().includes('bbq'),
        );
      } else if (filter.categorySlug === 'coffee' || filter.categorySlug === 'cafe') {
        result = result.filter(
          (d) =>
            d.title.toLowerCase().includes('latte') ||
            d.title.toLowerCase().includes('coffee') ||
            d.title.toLowerCase().includes('tea'),
        );
      }
    }

    if (filter?.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.restaurant.name.toLowerCase().includes(q) ||
          d.restaurant.areaName.toLowerCase().includes(q),
      );
    }

    return simulateLatency(result);
  },

  async getDealById(id: string): Promise<Deal | null> {
    const found = MOCK_DEALS.find((d) => d.id === id) || null;
    return simulateLatency(found);
  },
};
