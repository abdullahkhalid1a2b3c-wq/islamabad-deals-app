-- 0009_restaurant_best_deal.sql
-- Extend search_restaurants RPC to return best_deal summary and active_deal_count per restaurant

CREATE OR REPLACE FUNCTION public.search_restaurants(
  p_lat DOUBLE PRECISION DEFAULT NULL,
  p_lng DOUBLE PRECISION DEFAULT NULL,
  p_radius_m INT DEFAULT 50000,
  p_category_id UUID DEFAULT NULL,
  p_category_slug TEXT DEFAULT NULL,
  p_area_id UUID DEFAULT NULL,
  p_price_range INT DEFAULT NULL,
  p_open_now BOOLEAN DEFAULT FALSE,
  p_sort TEXT DEFAULT 'popular',
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
  opening_hours JSONB,
  best_deal JSON,
  active_deal_count INT
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
DECLARE
  v_user_geom geography := NULL;
  v_limit INT := LEAST(COALESCE(p_limit, 20), 50);
  v_offset INT := GREATEST(COALESCE(p_offset, 0), 0);
  v_now_karachi TIMESTAMPTZ;
  v_day_name TEXT;
  v_time_str TEXT;
BEGIN
  IF p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
    v_user_geom := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;
  END IF;

  v_now_karachi := timezone('Asia/Karachi', now());
  v_day_name := lower(trim(to_char(v_now_karachi, 'Day')));
  v_time_str := to_char(v_now_karachi, 'HH24:MI');

  RETURN QUERY
  WITH restaurant_deals AS (
    SELECT
      d.restaurant_id,
      COUNT(d.id)::INT AS deal_cnt,
      (
        SELECT json_build_object(
          'id', bd.id,
          'title', bd.title,
          'discountPercent', bd.discount_percent,
          'originalPricePKR', bd.original_price,
          'dealPricePKR', bd.deal_price,
          'dealType', bd.deal_type
        )
        FROM public.deals bd
        WHERE bd.restaurant_id = d.restaurant_id
          AND bd.status = 'active'
          AND bd.ends_at > timezone('utc'::text, now())
        ORDER BY COALESCE(bd.discount_percent, 0) DESC, bd.created_at DESC
        LIMIT 1
      ) AS top_deal
    FROM public.deals d
    WHERE d.status = 'active'
      AND d.ends_at > timezone('utc'::text, now())
    GROUP BY d.restaurant_id
  )
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
    r.opening_hours,
    rd.top_deal AS best_deal,
    COALESCE(rd.deal_cnt, 0) AS active_deal_count
  FROM public.restaurants r
  JOIN public.areas a ON r.area_id = a.id
  LEFT JOIN restaurant_deals rd ON r.id = rd.restaurant_id
  LEFT JOIN public.restaurant_categories rc ON r.id = rc.restaurant_id
  LEFT JOIN public.categories c ON rc.category_id = c.id
  WHERE r.status = 'active'
    AND (p_area_id IS NULL OR r.area_id = p_area_id)
    AND (p_price_range IS NULL OR r.price_range = p_price_range)
    AND (p_search_query IS NULL OR (r.name ILIKE '%' || p_search_query || '%' OR a.name ILIKE '%' || p_search_query || '%'))
    AND (v_user_geom IS NULL OR ST_DWithin(r.location, v_user_geom, GREATEST(p_radius_m, 1000)))
    AND (
      p_category_id IS NULL AND (p_category_slug IS NULL OR p_category_slug = '' OR p_category_slug = 'all')
      OR (p_category_id IS NOT NULL AND rc.category_id = p_category_id)
      OR (p_category_slug IS NOT NULL AND (
            c.slug = p_category_slug
            OR p_category_slug = ANY(r.cuisines)
            OR r.name ILIKE '%' || p_category_slug || '%'
          ))
    )
    AND (
      NOT p_open_now
      OR (
        r.opening_hours ? v_day_name
        AND jsonb_array_length(r.opening_hours->v_day_name) > 0
      )
    )
  GROUP BY r.id, a.name, rd.top_deal, rd.deal_cnt
  ORDER BY
    CASE WHEN p_sort = 'nearest' AND v_user_geom IS NOT NULL THEN ST_Distance(r.location, v_user_geom) END ASC NULLS LAST,
    CASE WHEN p_sort = 'top_rated' THEN r.rating_avg END DESC NULLS LAST,
    CASE WHEN p_sort = 'newest' THEN r.created_at END DESC NULLS LAST,
    r.rating_avg DESC,
    r.review_count DESC
  LIMIT v_limit
  OFFSET v_offset;
END;
$$;
