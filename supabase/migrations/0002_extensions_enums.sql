-- 0002_extensions_enums.sql
-- Enables PostGIS & pg_trgm extensions and creates domain ENUM types

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Create Enums
CREATE TYPE public.restaurant_status AS ENUM ('pending', 'active', 'rejected', 'suspended');
CREATE TYPE public.deal_status AS ENUM ('draft', 'active', 'paused', 'expired');
CREATE TYPE public.deal_type AS ENUM ('bogo', 'percent_off', 'fixed_price', 'free_delivery', 'happy_hour', 'student_discount');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE public.service_mode AS ENUM ('dine_in', 'takeaway', 'delivery');
CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
