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

export interface ListRestaurantsParams {
  coords?: { lat: number; lng: number };
  categorySlug?: string | null;
  areaId?: string | null;
  priceRange?: number | null;
  openNow?: boolean;
  sort?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export interface ListRestaurantsResult {
  items: RestaurantSummary[];
  nextOffset: number | null;
}

export interface RestaurantsService {
  getPopularRestaurants(): Promise<RestaurantSummary[]>;
  getRestaurants(searchQuery?: string): Promise<RestaurantSummary[]>;
  listRestaurants(params: ListRestaurantsParams): Promise<ListRestaurantsResult>;
  getRestaurantById(id: string): Promise<Restaurant | null>;
}

export interface CategoriesService {
  getCategories(): Promise<Category[]>;
}

export interface AreasService {
  getAreas(): Promise<Area[]>;
}
