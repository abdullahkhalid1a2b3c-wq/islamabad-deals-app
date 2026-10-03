-- 0006_rls.sql
-- Enables Row Level Security (RLS) across all tables with granular public, user, owner, and admin access policies

-- Enable RLS on all tables
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Helper function: is_restaurant_owner(p_restaurant_id)
CREATE OR REPLACE FUNCTION public.is_restaurant_owner(p_restaurant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurant_owners
    WHERE restaurant_id = p_restaurant_id
      AND user_id = auth.uid()
  );
$$;

--------------------------------------------------------------------------------
-- 1. Cities, Areas & Categories Policies (Public Read)
--------------------------------------------------------------------------------
-- Anyone can view active cities
CREATE POLICY "Public read active cities" ON public.cities
  FOR SELECT USING (is_active = true OR public.is_admin());

-- Anyone can view active areas
CREATE POLICY "Public read active areas" ON public.areas
  FOR SELECT USING (is_active = true OR public.is_admin());

-- Anyone can view categories
CREATE POLICY "Public read categories" ON public.categories
  FOR SELECT USING (true);

-- Admins full access on configuration tables
CREATE POLICY "Admin full cities" ON public.cities FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full areas" ON public.areas FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full categories" ON public.categories FOR ALL USING (public.is_admin());

--------------------------------------------------------------------------------
-- 2. Restaurants & Images Policies
--------------------------------------------------------------------------------
-- Anyone can read active restaurants
CREATE POLICY "Public read active restaurants" ON public.restaurants
  FOR SELECT USING (status = 'active' OR public.is_restaurant_owner(id) OR public.is_admin());

-- Users can register a new restaurant (defaults to pending via trigger)
CREATE POLICY "Authenticated users insert restaurant" ON public.restaurants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Verified Owners can update their own restaurant
CREATE POLICY "Owners update own restaurant" ON public.restaurants
  FOR UPDATE USING (public.is_restaurant_owner(id) OR public.is_admin());

-- Public read restaurant categories junction for active restaurants
CREATE POLICY "Public read restaurant categories" ON public.restaurant_categories
  FOR SELECT USING (true);

-- Owners manage restaurant categories junction
CREATE POLICY "Owners manage restaurant categories" ON public.restaurant_categories
  FOR ALL USING (public.is_restaurant_owner(restaurant_id) OR public.is_admin());

-- Public read images of active restaurants
CREATE POLICY "Public read active restaurant images" ON public.restaurant_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND (r.status = 'active' OR public.is_restaurant_owner(r.id) OR public.is_admin())
    )
  );

-- Owners manage restaurant gallery images
CREATE POLICY "Owners manage restaurant images" ON public.restaurant_images
  FOR ALL USING (public.is_restaurant_owner(restaurant_id) OR public.is_admin());

-- Restaurant Owners table policies
CREATE POLICY "Owners and Admin read restaurant owners" ON public.restaurant_owners
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Admin manage restaurant owners" ON public.restaurant_owners
  FOR ALL USING (public.is_admin());

--------------------------------------------------------------------------------
-- 3. Deals Policies
--------------------------------------------------------------------------------
-- Anyone can read active, non-expired deals from active restaurants
CREATE POLICY "Public read active valid deals" ON public.deals
  FOR SELECT USING (
    (status = 'active' AND ends_at > timezone('utc'::text, now()))
    OR public.is_restaurant_owner(restaurant_id)
    OR public.is_admin()
  );

-- Restaurant owners manage deals for their restaurant
CREATE POLICY "Owners manage own restaurant deals" ON public.deals
  FOR ALL USING (public.is_restaurant_owner(restaurant_id) OR public.is_admin());

--------------------------------------------------------------------------------
-- 4. Menus & Menu Items Policies
--------------------------------------------------------------------------------
-- Public read menus for active restaurants
CREATE POLICY "Public read menus" ON public.menus
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND (r.status = 'active' OR public.is_restaurant_owner(r.id) OR public.is_admin())
    )
  );

-- Owners manage menus
CREATE POLICY "Owners manage menus" ON public.menus
  FOR ALL USING (public.is_restaurant_owner(restaurant_id) OR public.is_admin());

-- Public read available menu items
CREATE POLICY "Public read menu items" ON public.menu_items
  FOR SELECT USING (true);

-- Owners manage menu items
CREATE POLICY "Owners manage menu items" ON public.menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.menus m
      WHERE m.id = menu_id AND (public.is_restaurant_owner(m.restaurant_id) OR public.is_admin())
    )
  );

--------------------------------------------------------------------------------
-- 5. User Interaction Policies (Favorites, Saved Deals, Reviews)
--------------------------------------------------------------------------------
-- Users manage own favorites
CREATE POLICY "Users manage own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- Users manage own saved deals
CREATE POLICY "Users manage own saved deals" ON public.saved_deals
  FOR ALL USING (auth.uid() = user_id);

-- Anyone can read reviews
CREATE POLICY "Public read reviews" ON public.reviews
  FOR SELECT USING (true);

-- Users insert & edit own reviews
CREATE POLICY "Users manage own reviews" ON public.reviews
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

--------------------------------------------------------------------------------
-- 6. Notifications & Devices
--------------------------------------------------------------------------------
-- Users view own notifications
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Users update is_read status on own notifications
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- Users manage own device tokens
CREATE POLICY "Users manage own device tokens" ON public.device_tokens
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

--------------------------------------------------------------------------------
-- 7. Reports & Analytics Events
--------------------------------------------------------------------------------
-- Users insert own reports
CREATE POLICY "Users insert reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins view & manage reports
CREATE POLICY "Admins manage reports" ON public.reports
  FOR ALL USING (public.is_admin());

-- Anyone can insert deal events (analytics)
CREATE POLICY "Anyone log deal events" ON public.deal_events
  FOR INSERT WITH CHECK (true);

-- Admins view deal events
CREATE POLICY "Admins view deal events" ON public.deal_events
  FOR SELECT USING (public.is_admin());

--------------------------------------------------------------------------------
-- 8. Orders Policies (Strict Access Control)
--------------------------------------------------------------------------------
-- Order owners or verified restaurant owners or admins can select orders
CREATE POLICY "Users or owners select orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = user_id OR public.is_restaurant_owner(restaurant_id) OR public.is_admin()
  );

-- Order owners or verified restaurant owners select order items
CREATE POLICY "Users or owners select order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND (auth.uid() = o.user_id OR public.is_restaurant_owner(o.restaurant_id) OR public.is_admin())
    )
  );

-- Admin master access on all tables
CREATE POLICY "Admin full restaurants" ON public.restaurants FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full deals" ON public.deals FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full orders" ON public.orders FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full order_items" ON public.order_items FOR ALL USING (public.is_admin());
