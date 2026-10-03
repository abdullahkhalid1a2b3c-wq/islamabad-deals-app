import { RestaurantsService, ListRestaurantsParams, ListRestaurantsResult } from '../api/types';
import { Restaurant, RestaurantSummary } from '../../types/domain';
import { supabase } from '../../lib/supabase';
import { toAppError } from '../../lib/errors';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase RPC untyped JSON row return
function mapRPCRestaurantToSummary(row: any): RestaurantSummary {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url,
    coverUrl: row.cover_url || undefined,
    areaName: row.area_name || 'Islamabad',
    rating: Number(row.rating_avg) || 0.0,
    reviewCount: row.review_count || 0,
    cuisine: row.cuisine || [],
    priceRange: row.price_range || 2,
    distanceM: row.distance_m ? Number(row.distance_m) : undefined,
    openingHours: row.opening_hours || {},
    bestDeal: row.best_deal || null,
    activeDealCount: row.active_deal_count || 0,
  };
}

export const supabaseRestaurantsService: RestaurantsService = {
  async getPopularRestaurants(): Promise<RestaurantSummary[]> {
    try {
      const { data, error } = await supabase.rpc('search_restaurants', {
        p_limit: 10,
      });

      if (error) throw error;
      return (data || []).map(mapRPCRestaurantToSummary);
    } catch (err) {
      throw toAppError(err);
    }
  },

  async getRestaurants(searchQuery?: string): Promise<RestaurantSummary[]> {
    try {
      const { data, error } = await supabase.rpc('search_restaurants', {
        p_search_query: searchQuery || undefined,
        p_limit: 20,
      });

      if (error) throw error;
      return (data || []).map(mapRPCRestaurantToSummary);
    } catch (err) {
      throw toAppError(err);
    }
  },

  async listRestaurants(params: ListRestaurantsParams): Promise<ListRestaurantsResult> {
    try {
      const limit = params.limit || 15;
      const offset = params.offset || 0;

      const { data, error } = await supabase.rpc('search_restaurants', {
        p_lat: params.coords?.lat,
        p_lng: params.coords?.lng,
        p_category_slug: params.categorySlug || undefined,
        p_area_id: params.areaId || undefined,
        p_price_range: params.priceRange || undefined,
        p_open_now: params.openNow || false,
        p_sort: params.sort || 'popular',
        p_search_query: params.searchQuery || undefined,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) throw error;

      const items = (data || []).map(mapRPCRestaurantToSummary);
      const nextOffset = items.length >= limit ? offset + limit : null;

      return {
        items,
        nextOffset,
      };
    } catch (err) {
      throw toAppError(err);
    }
  },

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select(
          `
          *,
          area:areas(name)
        `,
        )
        .eq('id', id)
        .single();

      if (error || !data) return null;

      const restaurant: Restaurant = {
        id: data.id,
        name: data.name,
        logoUrl: data.logo_url,
        coverUrl: data.cover_url || undefined,
        areaName: (data.area as { name?: string } | null)?.name || 'Islamabad',
        rating: Number(data.rating_avg) || 0.0,
        reviewCount: data.review_count || 0,
        cuisine: data.cuisines || [],
        priceRange: data.price_range as 1 | 2 | 3 | 4,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSONB OpeningHours object
        openingHours: data.opening_hours as any,
        address: data.address,
        location: { lat: 33.7294, lng: 73.0747 },
        phone: data.phone,
        serviceModes: ['dine_in', 'takeaway', 'delivery'],
      };

      return restaurant;
    } catch (err) {
      throw toAppError(err);
    }
  },
};
