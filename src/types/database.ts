export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      cities: {
        Row: {
          id: string;
          name: string;
          country: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          country?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          country?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      areas: {
        Row: {
          id: string;
          city_id: string;
          name: string;
          slug: string;
          lat: number;
          lng: number;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          city_id: string;
          name: string;
          slug: string;
          lat: number;
          lng: number;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          city_id?: string;
          name?: string;
          slug?: string;
          lat?: number;
          lng?: number;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          kind: 'business_type' | 'cuisine';
          icon_name: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          kind: 'business_type' | 'cuisine';
          icon_name?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          kind?: 'business_type' | 'cuisine';
          icon_name?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      restaurants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          area_id: string;
          address: string;
          phone: string;
          opening_hours: Json;
          cuisines: string[];
          features: string[];
          price_range: number;
          status: 'pending' | 'active' | 'rejected' | 'suspended';
          is_featured: boolean;
          ordering_url: string | null;
          whatsapp: string | null;
          logo_url: string;
          cover_url: string | null;
          rating_avg: number;
          review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          area_id: string;
          address: string;
          phone: string;
          opening_hours?: Json;
          cuisines?: string[];
          features?: string[];
          price_range: number;
          status?: 'pending' | 'active' | 'rejected' | 'suspended';
          is_featured?: boolean;
          ordering_url?: string | null;
          whatsapp?: string | null;
          logo_url: string;
          cover_url?: string | null;
          rating_avg?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          area_id?: string;
          address?: string;
          phone?: string;
          opening_hours?: Json;
          cuisines?: string[];
          features?: string[];
          price_range?: number;
          status?: 'pending' | 'active' | 'rejected' | 'suspended';
          is_featured?: boolean;
          ordering_url?: string | null;
          whatsapp?: string | null;
          logo_url?: string;
          cover_url?: string | null;
          rating_avg?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      deals: {
        Row: {
          id: string;
          restaurant_id: string;
          category_id: string | null;
          title: string;
          description: string;
          deal_type:
            | 'bogo'
            | 'percent_off'
            | 'fixed_price'
            | 'free_delivery'
            | 'happy_hour'
            | 'student_discount';
          discount_percent: number | null;
          original_price: number | null;
          deal_price: number;
          image_url: string;
          starts_at: string;
          ends_at: string;
          daily_start_time: string | null;
          daily_end_time: string | null;
          days_of_week: number[] | null;
          status: 'draft' | 'active' | 'paused' | 'expired';
          is_featured: boolean;
          is_exclusive: boolean;
          terms: string[];
          service_modes: ('dine_in' | 'takeaway' | 'delivery')[];
          max_redemptions_per_user: number | null;
          total_redemptions: number;
          code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          category_id?: string | null;
          title: string;
          description: string;
          deal_type:
            | 'bogo'
            | 'percent_off'
            | 'fixed_price'
            | 'free_delivery'
            | 'happy_hour'
            | 'student_discount';
          discount_percent?: number | null;
          original_price?: number | null;
          deal_price: number;
          image_url: string;
          starts_at?: string;
          ends_at: string;
          daily_start_time?: string | null;
          daily_end_time?: string | null;
          days_of_week?: number[] | null;
          status?: 'draft' | 'active' | 'paused' | 'expired';
          is_featured?: boolean;
          is_exclusive?: boolean;
          terms?: string[];
          service_modes?: ('dine_in' | 'takeaway' | 'delivery')[];
          max_redemptions_per_user?: number | null;
          total_redemptions?: number;
          code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          category_id?: string | null;
          title?: string;
          description?: string;
          deal_type?:
            | 'bogo'
            | 'percent_off'
            | 'fixed_price'
            | 'free_delivery'
            | 'happy_hour'
            | 'student_discount';
          discount_percent?: number | null;
          original_price?: number | null;
          deal_price?: number;
          image_url?: string;
          starts_at?: string;
          ends_at?: string;
          daily_start_time?: string | null;
          daily_end_time?: string | null;
          days_of_week?: number[] | null;
          status?: 'draft' | 'active' | 'paused' | 'expired';
          is_featured?: boolean;
          is_exclusive?: boolean;
          terms?: string[];
          service_modes?: ('dine_in' | 'takeaway' | 'delivery')[];
          max_redemptions_per_user?: number | null;
          total_redemptions?: number;
          code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      search_deals: {
        Args: {
          p_lat?: number;
          p_lng?: number;
          p_radius_m?: number;
          p_category_ids?: string[];
          p_area_id?: string;
          p_min_discount?: number;
          p_max_price?: number;
          p_active_now?: boolean;
          p_sort?: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: {
          id: string;
          restaurant_id: string;
          category_id: string;
          title: string;
          description: string;
          deal_type:
            | 'bogo'
            | 'percent_off'
            | 'fixed_price'
            | 'free_delivery'
            | 'happy_hour'
            | 'student_discount';
          discount_percent: number;
          original_price: number;
          deal_price: number;
          image_url: string;
          starts_at: string;
          ends_at: string;
          daily_start_time: string;
          daily_end_time: string;
          days_of_week: number[];
          status: 'draft' | 'active' | 'paused' | 'expired';
          is_featured: boolean;
          is_exclusive: boolean;
          restaurant_name: string;
          restaurant_logo_url: string;
          area_name: string;
          distance_m: number;
        }[];
      };
      search_restaurants: {
        Args: {
          p_lat?: number;
          p_lng?: number;
          p_radius_m?: number;
          p_category_id?: string;
          p_area_id?: string;
          p_price_range?: number;
          p_search_query?: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: {
          id: string;
          name: string;
          slug: string;
          area_name: string;
          rating_avg: number;
          review_count: number;
          cuisine: string[];
          price_range: number;
          logo_url: string;
          cover_url: string;
          distance_m: number;
          opening_hours: Json;
        }[];
      };
      get_home_feed: {
        Args: {
          p_lat?: number;
          p_lng?: number;
        };
        Returns: Json;
      };
    };
  };
}
