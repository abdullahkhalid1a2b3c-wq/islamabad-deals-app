import {
  Deal,
  DealSummary,
  Restaurant,
  RestaurantSummary,
  Category,
  Area,
} from '../../types/domain';

export interface DealsFilter {
  categorySlug?: string | null;
  areaSlug?: string | null;
  dealType?: string | null;
  searchQuery?: string;
  isFeatured?: boolean;
}

export interface DealsService {
  getFeaturedDeals(): Promise<DealSummary[]>;
  getNearbyDeals(): Promise<DealSummary[]>;
  getExpiringDeals(): Promise<DealSummary[]>;
  getNewDeals(): Promise<DealSummary[]>;
  getDeals(filter?: DealsFilter): Promise<DealSummary[]>;
  getDealById(id: string): Promise<Deal | null>;
}

export interface RestaurantsService {
  getPopularRestaurants(): Promise<RestaurantSummary[]>;
  getRestaurants(searchQuery?: string): Promise<RestaurantSummary[]>;
  getRestaurantById(id: string): Promise<Restaurant | null>;
}

export interface CategoriesService {
  getCategories(): Promise<Category[]>;
}

export interface AreasService {
  getAreas(): Promise<Area[]>;
}
