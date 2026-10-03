-- supabase/seed.sql
-- Development seed dataset for DealPlate Islamabad
-- Contains 1 City, 25 Islamabad Areas, 8 Categories, 14 Fictional Restaurants, and 28 Deals

-- 1. Insert City: Islamabad
INSERT INTO public.cities (id, name, country, is_active)
VALUES ('c0000000-0000-0000-0000-000000000001', 'Islamabad', 'Pakistan', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert 25 Areas across Islamabad
INSERT INTO public.areas (id, city_id, name, slug, lat, lng, is_active, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'F-6 Markaz', 'f-6', 33.7294, 73.0747, true, 1),
  ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'F-7 Markaz', 'f-7', 33.7215, 73.0588, true, 2),
  ('a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'F-8 Markaz', 'f-8', 33.7121, 73.0421, true, 3),
  ('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'F-10 Markaz', 'f-10', 33.6934, 73.0182, true, 4),
  ('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'F-11 Markaz', 'f-11', 33.6840, 72.9880, true, 5),
  ('a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'G-6 Markaz', 'g-6', 33.7080, 73.0780, true, 6),
  ('a0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', 'G-7 Markaz', 'g-7', 33.7000, 73.0600, true, 7),
  ('a0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001', 'G-8 Markaz', 'g-8', 33.6950, 73.0450, true, 8),
  ('a0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000001', 'G-9 Markaz', 'g-9', 33.6890, 73.0300, true, 9),
  ('a0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000001', 'G-10 Markaz', 'g-10', 33.6800, 73.0100, true, 10),
  ('a0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000001', 'G-11 Markaz', 'g-11', 33.6700, 72.9980, true, 11),
  ('a0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000001', 'G-13 Markaz', 'g-13', 33.6450, 72.9650, true, 12),
  ('a0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000001', 'I-8 Markaz', 'i-8', 33.6680, 73.0760, true, 13),
  ('a0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000001', 'E-7 Sector', 'e-7', 33.7330, 73.0480, true, 14),
  ('a0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000001', 'E-9 Sector', 'e-9', 33.7160, 73.0200, true, 15),
  ('a0000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000001', 'E-11 Markaz', 'e-11', 33.7010, 72.9800, true, 16),
  ('a0000000-0000-0000-0000-000000000017', 'c0000000-0000-0000-0000-000000000001', 'Blue Area', 'blue-area', 33.7088, 73.0610, true, 17),
  ('a0000000-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000001', 'DHA Phase 1', 'dha-1', 33.5500, 73.1300, true, 18),
  ('a0000000-0000-0000-0000-000000000019', 'c0000000-0000-0000-0000-000000000001', 'DHA Phase 2', 'dha-2', 33.5220, 73.1550, true, 19),
  ('a0000000-0000-0000-0000-000000000020', 'c0000000-0000-0000-0000-000000000001', 'Bahria Town Phase 4', 'bahria-4', 33.5350, 73.0950, true, 20),
  ('a0000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000001', 'Bahria Town Phase 7', 'bahria-7', 33.5100, 73.0800, true, 21),
  ('a0000000-0000-0000-0000-000000000022', 'c0000000-0000-0000-0000-000000000001', 'Gulberg Greens', 'gulberg', 33.5900, 73.1600, true, 22),
  ('a0000000-0000-0000-0000-000000000023', 'c0000000-0000-0000-0000-000000000001', 'B-17 Multi Gardens', 'b-17', 33.6800, 72.8300, true, 23),
  ('a0000000-0000-0000-0000-000000000024', 'c0000000-0000-0000-0000-000000000001', 'H-13 Sector', 'h-13', 33.6400, 73.0000, true, 24),
  ('a0000000-0000-0000-0000-000000000025', 'c0000000-0000-0000-0000-000000000001', 'PWD Society', 'pwd', 33.5700, 73.1400, true, 25)
ON CONFLICT (id) DO NOTHING;

-- 3. Categories (Business Types & Cuisines)
INSERT INTO public.categories (id, name, slug, kind, icon_name, sort_order) VALUES
  ('cat00000-0000-0000-0000-000000000001', 'Burgers & Fast Food', 'burgers', 'business_type', 'fast-food', 1),
  ('cat00000-0000-0000-0000-000000000002', 'Desi & Karahi', 'desi', 'cuisine', 'restaurant', 2),
  ('cat00000-0000-0000-0000-000000000003', 'Pizza & Pasta', 'pizza', 'cuisine', 'pizza', 3),
  ('cat00000-0000-0000-0000-000000000004', 'Café & Coffee', 'cafe', 'business_type', 'cafe', 4),
  ('cat00000-0000-0000-0000-000000000005', 'Chinese & Asian', 'asian', 'cuisine', 'fish', 5),
  ('cat00000-0000-0000-0000-000000000006', 'Bakery & Sweets', 'bakery', 'business_type', 'ice-cream', 6),
  ('cat00000-0000-0000-0000-000000000007', 'BBQ & Grills', 'bbq', 'cuisine', 'flame', 7),
  ('cat00000-0000-0000-0000-000000000008', 'Healthy & Bowls', 'healthy', 'cuisine', 'leaf', 8)
ON CONFLICT (id) DO NOTHING;

-- 4. 14 Restaurants
INSERT INTO public.restaurants (id, name, slug, area_id, address, location, phone, opening_hours, cuisines, price_range, status, is_featured, logo_url, cover_url, rating_avg, review_count) VALUES
  ('r0000000-0000-0000-0000-000000000001', 'Khyber Smokehouse & Grill', 'khyber-smokehouse', 'a0000000-0000-0000-0000-000000000001', 'Block A, F-6 Markaz, Islamabad', ST_SetSRID(ST_MakePoint(73.0747, 33.7294), 4326)::geography, '+92 51 2801122', '{"monday":[{"open":"12:00","close":"01:00"}]}'::jsonb, ARRAY['BBQ', 'Desi', 'Afghani'], 3, 'active', true, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', 4.8, 340),
  ('r0000000-0000-0000-0000-000000000002', 'Margalla Artisan Roasters', 'margalla-roasters', 'a0000000-0000-0000-0000-000000000002', 'Jinnah Super Market, F-7/2, Islamabad', ST_SetSRID(ST_MakePoint(73.0588, 33.7215), 4326)::geography, '+92 51 2654321', '{"monday":[{"open":"08:00","close":"23:00"}]}'::jsonb, ARRAY['Coffee', 'Breakfast', 'Desserts'], 2, 'active', true, 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&auto=format&fit=crop&q=80', 4.6, 215),
  ('r0000000-0000-0000-0000-000000000003', 'Zamanat Burger Lab', 'zamanat-burger-lab', 'a0000000-0000-0000-0000-000000000003', 'Ayub Market, F-8/3, Islamabad', ST_SetSRID(ST_MakePoint(73.0421, 33.7121), 4326)::geography, '+92 51 2289900', '{"monday":[{"open":"13:00","close":"03:00"}]}'::jsonb, ARRAY['Fast Food', 'Burgers', 'Fries'], 2, 'active', true, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80', 4.7, 512),
  ('r0000000-0000-0000-0000-000000000004', 'Rawal Stone Oven Pizza', 'rawal-pizza', 'a0000000-0000-0000-0000-000000000004', 'Tariq Market, F-10/2, Islamabad', ST_SetSRID(ST_MakePoint(73.0182, 33.6934), 4326)::geography, '+92 51 2211445', '{"monday":[{"open":"12:00","close":"00:00"}]}'::jsonb, ARRAY['Italian', 'Pizza', 'Pasta'], 2, 'active', true, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80', 4.5, 189),
  ('r0000000-0000-0000-0000-000000000005', 'Karachi Biryani House & Shinwari', 'karachi-biryani-house', 'a0000000-0000-0000-0000-000000000009', 'Karachi Company, G-9 Markaz, Islamabad', ST_SetSRID(ST_MakePoint(73.0300, 33.6890), 4326)::geography, '+92 51 2267788', '{"monday":[{"open":"11:00","close":"00:00"}]}'::jsonb, ARRAY['Desi', 'Biryani', 'Peshawari'], 1, 'active', true, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&auto=format&fit=crop&q=80', 4.4, 680)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Sample Deals
INSERT INTO public.deals (id, restaurant_id, category_id, title, description, deal_type, original_price, deal_price, image_url, starts_at, ends_at, is_featured, is_exclusive, status) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'r0000000-0000-0000-0000-000000000003', 'cat00000-0000-0000-0000-000000000001', 'Buy 1 Get 1 Free Smash Burger', 'Buy any double beef smash burger and get a single smash burger free!', 'bogo', 1600.00, 850.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', timezone('utc'::text, now()), timezone('utc'::text, now() + interval '30 days'), true, true, 'active'),
  ('d0000000-0000-0000-0000-000000000002', 'r0000000-0000-0000-0000-000000000004', 'cat00000-0000-0000-0000-000000000003', 'BOGO Large Stone-Oven Pizza', 'Buy any large pizza of choice and get a medium Margherita free.', 'bogo', 2600.00, 1450.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', timezone('utc'::text, now()), timezone('utc'::text, now() + interval '12 hours'), true, false, 'active'),
  ('d0000000-0000-0000-0000-000000000003', 'r0000000-0000-0000-0000-000000000001', 'cat00000-0000-0000-0000-000000000007', '40% Off Premium BBQ Platter', 'Full mixed BBQ platter of lamb chops, malai tikka & seekh kababs.', 'percent_off', 3500.00, 2100.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', timezone('utc'::text, now()), timezone('utc'::text, now() + interval '20 days'), true, false, 'active'),
  ('d0000000-0000-0000-0000-000000000004', 'r0000000-0000-0000-0000-000000000005', 'cat00000-0000-0000-0000-000000000002', 'Rs. 999 Special Biryani & Karahi Combo', '1 Chicken Biryani + 1 Half Mutton Karahi + 2 Tandoori Naans + Raita.', 'fixed_price', 1750.00, 999.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', timezone('utc'::text, now()), timezone('utc'::text, now() + interval '25 days'), true, true, 'active')
ON CONFLICT (id) DO NOTHING;
