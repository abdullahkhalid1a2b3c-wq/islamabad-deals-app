-- 0004_indexes.sql
-- Spatial, Trigram, GIN, and B-Tree indexes for high performance query execution

-- 1. Spatial GIST Index for Geo-Location Queries (ST_Distance)
CREATE INDEX idx_restaurants_location ON public.restaurants USING GIST (location);

-- 2. Restaurants B-Tree & GIN Indexes
CREATE INDEX idx_restaurants_area_id ON public.restaurants(area_id);
CREATE INDEX idx_restaurants_status ON public.restaurants(status);
CREATE INDEX idx_restaurants_is_featured ON public.restaurants(is_featured);
CREATE INDEX idx_restaurants_cuisines ON public.restaurants USING GIN (cuisines);

-- 3. Trigram Search Indexes for Fuzzy Search
CREATE INDEX idx_restaurants_name_trgm ON public.restaurants USING GIN (name gin_trgm_ops);
CREATE INDEX idx_deals_title_trgm ON public.deals USING GIN (title gin_trgm_ops);

-- 4. Deals Indexes
CREATE INDEX idx_deals_status_ends_at ON public.deals(status, ends_at);
CREATE INDEX idx_deals_restaurant_id ON public.deals(restaurant_id);
CREATE INDEX idx_deals_category_id ON public.deals(category_id);
CREATE INDEX idx_deals_discount_percent ON public.deals(discount_percent DESC);
CREATE INDEX idx_deals_created_at ON public.deals(created_at DESC);
CREATE INDEX idx_deals_is_featured ON public.deals(is_featured);

-- 5. Notifications & User Tokens Indexes
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_device_tokens_user_id ON public.device_tokens(user_id);

-- 6. Supporting Foreign Key Indexes
CREATE INDEX idx_areas_city_id ON public.areas(city_id);
CREATE INDEX idx_restaurant_categories_cat_id ON public.restaurant_categories(category_id);
CREATE INDEX idx_restaurant_images_rest_id ON public.restaurant_images(restaurant_id);
CREATE INDEX idx_restaurant_owners_user_id ON public.restaurant_owners(user_id);
CREATE INDEX idx_menus_restaurant_id ON public.menus(restaurant_id);
CREATE INDEX idx_menu_items_menu_id ON public.menu_items(menu_id);
CREATE INDEX idx_favorites_rest_id ON public.favorites(restaurant_id);
CREATE INDEX idx_saved_deals_deal_id ON public.saved_deals(deal_id);
CREATE INDEX idx_reviews_rest_id ON public.reviews(restaurant_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_rest_id ON public.orders(restaurant_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
