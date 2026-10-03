-- 0007_functions.sql
-- RPC functions for geo-queries, search, home feeds, analytics logging, and deal expiry cron

-- 1. Helper Function: Check if deal is active right now in Asia/Karachi time
CREATE OR REPLACE FUNCTION public.is_deal_active_in_karachi(
  p_starts_at TIMESTAMPTZ,
  p_ends_at TIMESTAMPTZ,
  p_daily_start TIME,
  p_daily_end TIME,
  p_days_of_week SMALLINT[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_now_karachi TIMESTAMPTZ;
  v_dow_karachi SMALLINT;
  v_time_karachi TIME;
BEGIN
  v_now_karachi := timezone('Asia/Karachi', now());

  -- Date bounds check
  IF v_now_karachi < p_starts_at OR v_now_karachi > p_ends_at THEN
    RETURN FALSE;
  END IF;

  -- Days of week check (0=Sunday, 1=Monday... 6=Saturday)
  IF p_days_of_week IS NOT NULL AND array_length(p_days_of_week, 1) > 0 THEN
    v_dow_karachi := EXTRACT(DOW FROM v_now_karachi)::SMALLINT;
    IF NOT (v_dow_karachi = ANY(p_days_of_week)) THEN
      RETURN FALSE;
    END IF;
  END IF;

  -- Daily time window check
  IF p_daily_start IS NOT NULL AND p_daily_end IS NOT NULL THEN
    v_time_karachi := v_now_karachi::TIME;
    IF p_daily_end <= p_daily_start THEN
      -- Overnight time window (e.g. 18:00 to 02:00)
      IF NOT (v_time_karachi >= p_daily_start OR v_time_karachi < p_daily_end) THEN
        RETURN FALSE;
      END IF;
    ELSE
      -- Daytime window (e.g. 12:00 to 18:00)
      IF NOT (v_time_karachi >= p_daily_start AND v_time_karachi <= p_daily_end) THEN
        RETURN FALSE;
      END IF;
    END IF;
  END IF;

  RETURN TRUE;
END;
$$;

-- 2. search_deals RPC
CREATE OR REPLACE FUNCTION public.search_deals(
  p_lat DOUBLE PRECISION DEFAULT NULL,
  p_lng DOUBLE PRECISION DEFAULT NULL,
  p_radius_m INT DEFAULT 50000,
  p_category_ids UUID[] DEFAULT NULL,
  p_area_id UUID DEFAULT NULL,
  p_min_discount INT DEFAULT 0,
  p_max_price NUMERIC DEFAULT NULL,
  p_active_now BOOLEAN DEFAULT FALSE,
  p_sort TEXT DEFAULT 'popular',
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  restaurant_id UUID,
  category_id UUID,
  title TEXT,
  description TEXT,
  deal_type public.deal_type,
  discount_percent INT,
  original_price NUMERIC,
  deal_price NUMERIC,
  image_url TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  daily_start_time TIME,
  daily_end_time TIME,
  days_of_week SMALLINT[],
  status public.deal_status,
  is_featured BOOLEAN,
  is_exclusive BOOLEAN,
  restaurant_name TEXT,
  restaurant_logo_url TEXT,
  area_name TEXT,
  distance_m INT
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
DECLARE
  v_user_geom geography := NULL;
  v_limit INT := LEAST(COALESCE(p_limit, 20), 50);
  v_offset INT := GREATEST(COALESCE(p_offset, 0), 0);
BEGIN
  IF p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
    v_user_geom := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;
  END IF;

  RETURN QUERY
  SELECT
    d.id,
    d.restaurant_id,
    d.category_id,
    d.title,
    d.description,
    d.deal_type,
    d.discount_percent,
    d.original_price,
    d.deal_price,
    d.image_url,
    d.starts_at,
    d.ends_at,
    d.daily_start_time,
    d.daily_end_time,
    d.days_of_week,
    d.status,
    d.is_featured,
    d.is_exclusive,
    r.name AS restaurant_name,
    r.logo_url AS restaurant_logo_url,
    a.name AS area_name,
    CASE WHEN v_user_geom IS NOT NULL THEN ROUND(ST_Distance(r.location, v_user_geom))::INT ELSE NULL END AS distance_m
  FROM public.deals d
  JOIN public.restaurants r ON d.restaurant_id = r.id
  JOIN public.areas a ON r.area_id = a.id
  WHERE d.status = 'active'
    AND d.ends_at > timezone('utc'::text, now())
    AND r.status = 'active'
    AND (p_area_id IS NULL OR r.area_id = p_area_id)
    AND (p_min_discount IS NULL OR d.discount_percent >= p_min_discount)
    AND (p_max_price IS NULL OR d.deal_price <= p_max_price)
    AND (p_category_ids IS NULL OR d.category_id = ANY(p_category_ids))
    AND (v_user_geom IS NULL OR ST_DWithin(r.location, v_user_geom, GREATEST(p_radius_m, 1000)))
    AND (NOT p_active_now OR public.is_deal_active_in_karachi(d.starts_at, d.ends_at, d.daily_start_time, d.daily_end_time, d.days_of_week))
  ORDER BY
    CASE WHEN p_sort = 'distance' AND v_user_geom IS NOT NULL THEN ST_Distance(r.location, v_user_geom) END ASC NULLS LAST,
    CASE WHEN p_sort = 'discount' THEN d.discount_percent END DESC NULLS LAST,
    CASE WHEN p_sort = 'ending_soon' THEN d.ends_at END ASC NULLS LAST,
    CASE WHEN p_sort = 'newest' THEN d.created_at END DESC NULLS LAST,
    d.is_featured DESC,
    d.total_redemptions DESC,
    d.created_at DESC
  LIMIT v_limit
  OFFSET v_offset;
END;
$$;

-- 3. search_restaurants RPC
CREATE OR REPLACE FUNCTION public.search_restaurants(
  p_lat DOUBLE PRECISION DEFAULT NULL,
  p_lng DOUBLE PRECISION DEFAULT NULL,
  p_radius_m INT DEFAULT 50000,
  p_category_id UUID DEFAULT NULL,
  p_area_id UUID DEFAULT NULL,
  p_price_range INT DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  area_name TEXT,
  rating_avg NUMERIC,
  review_count INT,
  cuisine TEXT[],
  price_range SMALLINT,
  logo_url TEXT,
  cover_url TEXT,
  distance_m INT,
  opening_hours JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
DECLARE
  v_user_geom geography := NULL;
  v_limit INT := LEAST(COALESCE(p_limit, 20), 50);
  v_offset INT := GREATEST(COALESCE(p_offset, 0), 0);
BEGIN
  IF p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
    v_user_geom := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;
  END IF;

  RETURN QUERY
  SELECT
    r.id,
    r.name,
    r.slug,
    a.name AS area_name,
    r.rating_avg,
    r.review_count,
    r.cuisines AS cuisine,
    r.price_range,
    r.logo_url,
    r.cover_url,
    CASE WHEN v_user_geom IS NOT NULL THEN ROUND(ST_Distance(r.location, v_user_geom))::INT ELSE NULL END AS distance_m,
    r.opening_hours
  FROM public.restaurants r
  JOIN public.areas a ON r.area_id = a.id
  WHERE r.status = 'active'
    AND (p_area_id IS NULL OR r.area_id = p_area_id)
    AND (p_price_range IS NULL OR r.price_range = p_price_range)
    AND (p_search_query IS NULL OR (r.name ILIKE '%' || p_search_query || '%' OR a.name ILIKE '%' || p_search_query || '%'))
    AND (v_user_geom IS NULL OR ST_DWithin(r.location, v_user_geom, GREATEST(p_radius_m, 1000)))
  ORDER BY
    CASE WHEN v_user_geom IS NOT NULL THEN ST_Distance(r.location, v_user_geom) END ASC NULLS LAST,
    r.rating_avg DESC,
    r.review_count DESC
  LIMIT v_limit
  OFFSET v_offset;
END;
$$;

-- 4. get_home_feed RPC
CREATE OR REPLACE FUNCTION public.get_home_feed(
  p_lat DOUBLE PRECISION DEFAULT 33.7294,
  p_lng DOUBLE PRECISION DEFAULT 73.0747
)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
DECLARE
  v_featured JSON;
  v_nearby JSON;
  v_expiring JSON;
  v_new JSON;
  v_popular_restaurants JSON;
BEGIN
  SELECT json_agg(t) INTO v_featured FROM (SELECT * FROM public.search_deals(p_lat, p_lng, 50000, NULL, NULL, 0, NULL, FALSE, 'popular', 5, 0) WHERE is_featured = true) t;
  SELECT json_agg(t) INTO v_nearby FROM (SELECT * FROM public.search_deals(p_lat, p_lng, 50000, NULL, NULL, 0, NULL, FALSE, 'distance', 10, 0)) t;
  SELECT json_agg(t) INTO v_expiring FROM (SELECT * FROM public.search_deals(p_lat, p_lng, 50000, NULL, NULL, 0, NULL, FALSE, 'ending_soon', 10, 0)) t;
  SELECT json_agg(t) INTO v_new FROM (SELECT * FROM public.search_deals(p_lat, p_lng, 50000, NULL, NULL, 0, NULL, FALSE, 'newest', 10, 0)) t;
  SELECT json_agg(t) INTO v_popular_restaurants FROM (SELECT * FROM public.search_restaurants(p_lat, p_lng, 50000, NULL, NULL, NULL, NULL, 10, 0)) t;

  RETURN json_build_object(
    'featured', COALESCE(v_featured, '[]'::json),
    'nearby', COALESCE(v_nearby, '[]'::json),
    'expiring_soon', COALESCE(v_expiring, '[]'::json),
    'new', COALESCE(v_new, '[]'::json),
    'popular_restaurants', COALESCE(v_popular_restaurants, '[]'::json)
  );
END;
$$;

-- 5. global_search RPC
CREATE OR REPLACE FUNCTION public.global_search(
  p_query TEXT,
  p_lat DOUBLE PRECISION DEFAULT NULL,
  p_lng DOUBLE PRECISION DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
DECLARE
  v_q TEXT := TRIM(p_query);
  v_deals JSON;
  v_restaurants JSON;
  v_areas JSON;
  v_categories JSON;
BEGIN
  IF length(v_q) < 2 THEN
    RETURN json_build_object('deals', '[]'::json, 'restaurants', '[]'::json, 'areas', '[]'::json, 'categories', '[]'::json);
  END IF;

  SELECT json_agg(t) INTO v_deals FROM (SELECT * FROM public.search_deals(p_lat, p_lng, 50000, NULL, NULL, 0, NULL, FALSE, 'popular', 10, 0) WHERE title ILIKE '%' || v_q || '%' OR restaurant_name ILIKE '%' || v_q || '%') t;
  SELECT json_agg(t) INTO v_restaurants FROM (SELECT * FROM public.search_restaurants(p_lat, p_lng, 50000, NULL, NULL, NULL, v_q, 10, 0)) t;
  SELECT json_agg(t) INTO v_areas FROM (SELECT id, name, slug FROM public.areas WHERE name ILIKE '%' || v_q || '%' LIMIT 5) t;
  SELECT json_agg(t) INTO v_categories FROM (SELECT id, name, slug, icon_name FROM public.categories WHERE name ILIKE '%' || v_q || '%' LIMIT 5) t;

  RETURN json_build_object(
    'deals', COALESCE(v_deals, '[]'::json),
    'restaurants', COALESCE(v_restaurants, '[]'::json),
    'areas', COALESCE(v_areas, '[]'::json),
    'categories', COALESCE(v_categories, '[]'::json)
  );
END;
$$;

-- 6. log_deal_event RPC
CREATE OR REPLACE FUNCTION public.log_deal_event(
  p_deal_id UUID,
  p_event TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.deal_events (deal_id, event_type, user_id)
  VALUES (p_deal_id, p_event, auth.uid());
END;
$$;

-- 7. expire_deals Function
CREATE OR REPLACE FUNCTION public.expire_deals()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE public.deals
  SET status = 'expired'::public.deal_status
  WHERE status = 'active'
    AND ends_at <= timezone('utc'::text, now());

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
