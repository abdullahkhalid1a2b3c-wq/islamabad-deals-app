import { DealsService, DealsFilter } from '../api/types';
import { Deal, DealSummary } from '../../types/domain';
import { supabase } from '../../lib/supabase';
import { toAppError } from '../../lib/errors';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase RPC untyped JSON row return
function mapRPCDealToSummary(row: any): DealSummary {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    dealType: row.deal_type,
    discountValue: row.discount_percent || 0,
    originalPricePKR: row.original_price ? Number(row.original_price) : undefined,
    dealPricePKR: Number(row.deal_price),
    imageUrl: row.image_url,
    startDate: row.starts_at,
    endDate: row.ends_at,
    dailyStartTime: row.daily_start_time || undefined,
    dailyEndTime: row.daily_end_time || undefined,
    isFeatured: row.is_featured,
    isExclusive: row.is_exclusive,
    restaurant: {
      id: row.restaurant_id,
      name: row.restaurant_name || 'Restaurant',
      logoUrl:
        row.restaurant_logo_url ||
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200',
      areaName: row.area_name || 'Islamabad',
      distanceM: row.distance_m ? Number(row.distance_m) : undefined,
    },
  };
}

export const supabaseDealsService: DealsService = {
  async getFeaturedDeals(): Promise<DealSummary[]> {
    try {
      const { data, error } = await supabase.rpc('search_deals', {
        p_sort: 'popular',
        p_limit: 10,
      });

      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase RPC untyped JSON row return
      const featured = (data || []).filter((d: any) => d.is_featured);
      return (featured.length > 0 ? featured : data || []).map(mapRPCDealToSummary);
    } catch (err) {
      throw toAppError(err);
    }
  },

  async getNearbyDeals(): Promise<DealSummary[]> {
    try {
      const { data, error } = await supabase.rpc('search_deals', {
        p_sort: 'distance',
        p_limit: 10,
      });

      if (error) throw error;
      return (data || []).map(mapRPCDealToSummary);
    } catch (err) {
      throw toAppError(err);
    }
  },

  async getExpiringDeals(): Promise<DealSummary[]> {
    try {
      const { data, error } = await supabase.rpc('search_deals', {
        p_sort: 'ending_soon',
        p_limit: 10,
      });

      if (error) throw error;
      return (data || []).map(mapRPCDealToSummary);
    } catch (err) {
      throw toAppError(err);
    }
  },

  async getNewDeals(): Promise<DealSummary[]> {
    try {
      const { data, error } = await supabase.rpc('search_deals', {
        p_sort: 'newest',
        p_limit: 10,
      });

      if (error) throw error;
      return (data || []).map(mapRPCDealToSummary);
    } catch (err) {
      throw toAppError(err);
    }
  },

  async getDeals(filter?: DealsFilter): Promise<DealSummary[]> {
    try {
      const { data, error } = await supabase.rpc('search_deals', {
        p_min_discount: filter?.isFeatured ? 1 : 0,
        p_sort: 'popular',
        p_limit: 20,
      });

      if (error) throw error;

      let result = (data || []).map(mapRPCDealToSummary);
      if (filter?.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        result = result.filter(
          (d: DealSummary) =>
            d.title.toLowerCase().includes(q) ||
            d.description.toLowerCase().includes(q) ||
            d.restaurant.name.toLowerCase().includes(q),
        );
      }
      return result;
    } catch (err) {
      throw toAppError(err);
    }
  },

  async getDealById(id: string): Promise<Deal | null> {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(
          `
          *,
          restaurant:restaurants(id, name, logo_url, area:areas(name))
        `,
        )
        .eq('id', id)
        .single();

      if (error || !data) return null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase join relationship object
      const restObj = data.restaurant as any;

      const deal: Deal = {
        id: data.id,
        title: data.title,
        description: data.description,
        dealType: data.deal_type,
        discountValue: data.discount_percent || 0,
        originalPricePKR: data.original_price ? Number(data.original_price) : undefined,
        dealPricePKR: Number(data.deal_price),
        imageUrl: data.image_url,
        startDate: data.starts_at,
        endDate: data.ends_at,
        dailyStartTime: data.daily_start_time || undefined,
        dailyEndTime: data.daily_end_time || undefined,
        isFeatured: data.is_featured,
        isExclusive: data.is_exclusive,
        termsAndConditions: data.terms || [],
        serviceModes: data.service_modes || ['dine_in', 'takeaway', 'delivery'],
        maxRedemptionsPerUser: data.max_redemptions_per_user || undefined,
        totalRedemptions: data.total_redemptions,
        code: data.code || undefined,
        restaurant: {
          id: restObj?.id || data.restaurant_id,
          name: restObj?.name || 'Restaurant',
          logoUrl:
            restObj?.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200',
          areaName: restObj?.area?.name || 'Islamabad',
        },
      };

      return deal;
    } catch (err) {
      throw toAppError(err);
    }
  },
};
