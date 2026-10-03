-- 0005_triggers.sql
-- Triggers for automated computations, timestamps, rating aggregations, and security checks

-- 1. Attach updated_at triggers to all mutable tables
CREATE TRIGGER set_cities_updated_at BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_areas_updated_at BEFORE UPDATE ON public.areas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_menus_updated_at BEFORE UPDATE ON public.menus FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Compute discount_percent automatically on deals
CREATE OR REPLACE FUNCTION public.compute_deal_discount_percent()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.original_price IS NOT NULL AND NEW.original_price > 0 AND NEW.deal_price < NEW.original_price THEN
    NEW.discount_percent := ROUND(((NEW.original_price - NEW.deal_price) / NEW.original_price) * 100);
  ELSE
    NEW.discount_percent := 0;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER calc_deal_discount_percent
  BEFORE INSERT OR UPDATE OF original_price, deal_price ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.compute_deal_discount_percent();

-- 3. Maintain rating_avg and review_count on restaurants
CREATE OR REPLACE FUNCTION public.recalculate_restaurant_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_rest_id UUID;
BEGIN
  target_rest_id := COALESCE(NEW.restaurant_id, OLD.restaurant_id);

  UPDATE public.restaurants
  SET
    rating_avg = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews WHERE restaurant_id = target_rest_id), 0.0),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE restaurant_id = target_rest_id)
  WHERE id = target_rest_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_restaurant_rating_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_restaurant_rating();

-- 4. Force non-admin created restaurants to status = 'pending'
CREATE OR REPLACE FUNCTION public.enforce_pending_restaurant_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.status := 'pending'::public.restaurant_status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_restaurant_creation_status
  BEFORE INSERT ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.enforce_pending_restaurant_status();
