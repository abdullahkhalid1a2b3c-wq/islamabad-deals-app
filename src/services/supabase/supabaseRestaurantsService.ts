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
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !UUID_REGEX.test(id)) {
      return null;
    }

    try {
      const [restRes, dealsRes, imagesRes, menusRes] = await Promise.all([
        supabase
          .from('restaurants')
          .select(
            `
            *,
            area:areas(name)
          `,
          )
          .eq('id', id)
          .eq('status', 'active')
          .single(),

        supabase
          .from('deals')
          .select('*')
          .eq('restaurant_id', id)
          .eq('status', 'active')
          .gt('ends_at', new Date().toISOString())
          .order('discount_percent', { ascending: false, nullsFirst: false }),

        supabase
          .from('restaurant_images')
          .select('image_url')
          .eq('restaurant_id', id)
          .order('sort_order', { ascending: true }),

        supabase
          .from('menus')
          .select(
            `
            id,
            title,
            sort_order,
            items:menu_items(id, name, description, price, image_url, is_available, sort_order)
          `,
          )
          .eq('restaurant_id', id)
          .order('sort_order', { ascending: true }),
      ]);

      if (restRes.error || !restRes.data) return null;

      const data = restRes.data;
      const areaName = (data.area as { name?: string } | null)?.name || 'Islamabad';

      // Map active deals
      interface RawDeal {
        id: string;
        title: string;
        description?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase enum string payload
        deal_type: any;
        discount_percent?: number;
        original_price?: number;
        deal_price: number;
        image_url: string;
        starts_at: string;
        ends_at: string;
        daily_start_time?: string;
        daily_end_time?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase smallint array payload
        days_of_week?: any;
        is_featured?: boolean;
        is_exclusive?: boolean;
      }

      const activeDeals = (dealsRes.data || []).map((d: RawDeal) => ({
        id: d.id,
        title: d.title,
        description: d.description || '',
        dealType: d.deal_type,
        discountValue: d.discount_percent || undefined,
        originalPricePKR: d.original_price ? Number(d.original_price) : undefined,
        dealPricePKR: Number(d.deal_price) || 0,
        imageUrl: d.image_url,
        startDate: d.starts_at,
        endDate: d.ends_at,
        dailyStartTime: d.daily_start_time || undefined,
        dailyEndTime: d.daily_end_time || undefined,
        daysOfWeek: d.days_of_week || undefined,
        isFeatured: d.is_featured,
        isExclusive: d.is_exclusive,
        restaurant: {
          id: data.id,
          name: data.name,
          logoUrl: data.logo_url,
          areaName,
        },
      }));

      // Map gallery images
      interface RawImage {
        image_url: string;
      }
      const images = (imagesRes.data || []).map((img: RawImage) => img.image_url);

      // Map menu sections
      interface RawMenuItem {
        id: string;
        name: string;
        description?: string;
        price: number;
        image_url?: string;
        is_available?: boolean;
        sort_order?: number;
      }

      interface RawMenuSection {
        id: string;
        title: string;
        items?: RawMenuItem[];
      }

      const menuSections = (menusRes.data || []).map((m: RawMenuSection) => ({
        id: m.id,
        title: m.title,
        items: (m.items || [])
          .sort((a: RawMenuItem, b: RawMenuItem) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((item: RawMenuItem) => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            pricePKR: Number(item.price) || 0,
            imageUrl: item.image_url || undefined,
            isAvailable: item.is_available !== false,
          })),
      }));

      const restaurant: Restaurant = {
        id: data.id,
        name: data.name,
        logoUrl: data.logo_url,
        coverUrl: data.cover_url || undefined,
        areaName,
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
        website: data.ordering_url || undefined,
        whatsapp: data.whatsapp || undefined,
        features: data.features || [],
        images,
        activeDeals,
        menuSections,
      };

      return restaurant;
    } catch (err) {
      throw toAppError(err);
    }
  },
};
