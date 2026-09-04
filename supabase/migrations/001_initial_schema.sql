-- =============================================================================
-- CHASHNI — Database Schema
-- =============================================================================
-- Multi-tenant restaurant platform schema for Supabase/PostgreSQL.
-- Run this migration to set up all tables, RLS policies, and indexes.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- =============================================================================
-- 1. TENANTS (Multi-tenancy root)
-- =============================================================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_fa TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slogan_fa TEXT,
  slogan_en TEXT,
  phone TEXT,
  address_fa TEXT,
  address_en TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#f59e0b',
  timezone TEXT DEFAULT 'Asia/Tehran',
  currency TEXT DEFAULT 'IRR',
  enabled_modules TEXT[] DEFAULT ARRAY['menu', 'orders', 'tables']::TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenants_slug ON tenants(slug);

-- =============================================================================
-- 2. PROFILES (Extended user profiles — linked to Supabase Auth)
-- =============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('super_admin', 'restaurant_admin', 'kitchen_staff', 'customer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- 3. TENANT_MEMBERS (Links users to tenants with roles)
-- =============================================================================
CREATE TABLE tenant_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'staff', 'kitchen')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_tenant_members_tenant ON tenant_members(tenant_id);
CREATE INDEX idx_tenant_members_user ON tenant_members(user_id);

-- =============================================================================
-- 4. CATEGORIES (Menu categories per tenant)
-- =============================================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name_fa TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT,
  sort_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_categories_tenant ON categories(tenant_id);

-- =============================================================================
-- 5. MENU_ITEMS (Menu items per tenant)
-- =============================================================================
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name_fa TEXT NOT NULL,
  name_en TEXT NOT NULL,
  desc_fa TEXT,
  desc_en TEXT,
  base_price INT NOT NULL DEFAULT 0,       -- Price in Toman (integer)
  image TEXT,
  calories INT DEFAULT 0,
  rating NUMERIC(3,1) DEFAULT 0,
  review_count INT DEFAULT 0,
  preparation_time INT DEFAULT 10,          -- Minutes
  spicy_level INT DEFAULT 0 CHECK (spicy_level BETWEEN 0 AND 5),
  is_vegetarian BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_chef_pick BOOLEAN DEFAULT false,
  ingredients JSONB DEFAULT '[]'::JSONB,    -- [{fa: "...", en: "..."}]
  allergens JSONB DEFAULT '[]'::JSONB,      -- [{fa: "...", en: "..."}]
  options JSONB DEFAULT '[]'::JSONB,        -- Option groups (flexible schema)
  extras JSONB DEFAULT '[]'::JSONB,         -- Extra items
  available BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_menu_items_tenant ON menu_items(tenant_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_available ON menu_items(tenant_id, available);
CREATE INDEX idx_menu_items_search ON menu_items USING gin (
  to_tsvector('simple', name_fa || ' ' || name_en || ' ' || COALESCE(desc_fa, '') || ' ' || COALESCE(desc_en, ''))
);

-- =============================================================================
-- 6. BURGER_COMPONENTS (Burger builder options per tenant)
-- =============================================================================
CREATE TABLE burger_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('bun', 'patty', 'cheese', 'toppings', 'sauce')),
  component_id TEXT NOT NULL,              -- e.g., "bun-brioche", "patty-double"
  name_fa TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price INT DEFAULT 0,                     -- Additional price in Toman
  calories INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, category, component_id)
);

CREATE INDEX idx_burger_components_tenant ON burger_components(tenant_id);
CREATE INDEX idx_burger_components_category ON burger_components(tenant_id, category);

-- =============================================================================
-- 7. TABLES (Physical tables per tenant for QR ordering)
-- =============================================================================
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  number INT NOT NULL,
  name TEXT,                                -- Optional display name
  capacity INT DEFAULT 4,
  qr_token TEXT UNIQUE NOT NULL,           -- Unique token for QR code
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, number)
);

CREATE INDEX idx_tables_tenant ON tables(tenant_id);
CREATE INDEX idx_tables_qr_token ON tables(qr_token);

-- =============================================================================
-- 8. ORDERS
-- =============================================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_number SERIAL,                     -- Auto-incrementing per tenant
  user_id UUID REFERENCES auth.users(id),
  table_id UUID REFERENCES tables(id),
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN (
    'received', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'
  )),
  order_type TEXT NOT NULL DEFAULT 'dine-in' CHECK (order_type IN ('dine-in', 'takeaway', 'delivery')),
  items JSONB NOT NULL,                     -- Immutable snapshot of ordered items
  subtotal INT NOT NULL DEFAULT 0,
  discount INT DEFAULT 0,
  tax INT DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  customer_name TEXT,
  customer_phone TEXT,
  notes TEXT,
  estimated_minutes INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_tenant ON orders(tenant_id);
CREATE INDEX idx_orders_status ON orders(tenant_id, status);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_created ON orders(tenant_id, created_at DESC);
CREATE INDEX idx_orders_table ON orders(table_id);

-- =============================================================================
-- 9. TENANT_SETTINGS (Per-tenant configuration)
-- =============================================================================
CREATE TABLE tenant_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, key)
);

CREATE INDEX idx_tenant_settings_tenant ON tenant_settings(tenant_id);

-- =============================================================================
-- 10. PAGES (Landing CMS pages per tenant)
-- =============================================================================
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title_fa TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_fa TEXT,
  description_en TEXT,
  is_published BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_pages_tenant ON pages(tenant_id);

-- =============================================================================
-- 11. PAGE_BLOCKS (Content blocks for CMS pages)
-- =============================================================================
CREATE TABLE page_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'hero', 'text', 'image', 'gallery', 'features', 'testimonials', 'cta', 'menu_highlight', 'custom_html'
  )),
  content JSONB NOT NULL DEFAULT '{}'::JSONB,
  sort_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_page_blocks_page ON page_blocks(page_id);

-- =============================================================================
-- 12. MEDIA (Uploaded files)
-- =============================================================================
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INT,
  alt_text TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_tenant ON media(tenant_id);

-- =============================================================================
-- 13. PROMOTIONS (Discounts and promo codes)
-- =============================================================================
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  description_fa TEXT,
  description_en TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INT NOT NULL,
  min_order INT DEFAULT 0,
  max_uses INT,
  used_count INT DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, code)
);

CREATE INDEX idx_promotions_tenant ON promotions(tenant_id);
CREATE INDEX idx_promotions_code ON promotions(tenant_id, code);

-- =============================================================================
-- 14. FAVORITES (User favorites per tenant)
-- =============================================================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, menu_item_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_tenant ON favorites(tenant_id);

-- =============================================================================
-- 15. SEARCH_HISTORY (User search history)
-- =============================================================================
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_history_user ON search_history(user_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE burger_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Helper function: Get current user's tenant_ids
CREATE OR REPLACE FUNCTION get_user_tenants()
RETURNS SETOF UUID AS $$
  SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: Check if user is super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: Check if user has role in tenant
CREATE OR REPLACE FUNCTION has_tenant_role(tenant UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_members
    WHERE user_id = auth.uid()
    AND tenant_id = tenant
    AND role = required_role
    AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: Check if user is member of tenant
CREATE OR REPLACE FUNCTION is_tenant_member(tenant UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_members
    WHERE user_id = auth.uid()
    AND tenant_id = tenant
    AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── TENANTS ────────────────────────────────────────────────────────────────

-- Public can read active tenants (for landing pages)
CREATE POLICY "tenants_select_public" ON tenants
  FOR SELECT USING (is_active = true);

-- Super admins can do everything
CREATE POLICY "tenants_super_admin_all" ON tenants
  FOR ALL USING (is_super_admin());

-- Tenant owners can update their own tenant
CREATE POLICY "tenants_owner_update" ON tenants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tenant_members
      WHERE user_id = auth.uid() AND tenant_id = tenants.id AND role = 'owner'
    )
  );

-- ─── PROFILES ───────────────────────────────────────────────────────────────

-- Users can read/update their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Super admins can read all profiles
CREATE POLICY "profiles_super_admin_all" ON profiles
  FOR ALL USING (is_super_admin());

-- ─── TENANT_MEMBERS ─────────────────────────────────────────────────────────

-- Tenant admins/owners can manage members
CREATE POLICY "tenant_members_admin_manage" ON tenant_members
  FOR ALL USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM tenant_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.tenant_id = tenant_members.tenant_id
      AND tm.role IN ('owner', 'admin')
    )
  );

-- Users can see their own memberships
CREATE POLICY "tenant_members_own" ON tenant_members
  FOR SELECT USING (user_id = auth.uid());

-- ─── CATEGORIES ─────────────────────────────────────────────────────────────

-- Public can read visible categories for active tenants
CREATE POLICY "categories_select_public" ON categories
  FOR SELECT USING (
    is_visible = true
    AND EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND is_active = true)
  );

-- Tenant admins can manage categories
CREATE POLICY "categories_tenant_admin" ON categories
  FOR ALL USING (
    is_super_admin() OR is_tenant_member(tenant_id)
  );

-- ─── MENU_ITEMS ─────────────────────────────────────────────────────────────

-- Public can read available menu items for active tenants
CREATE POLICY "menu_items_select_public" ON menu_items
  FOR SELECT USING (
    available = true
    AND EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND is_active = true)
  );

-- Tenant members can manage menu items
CREATE POLICY "menu_items_tenant_member" ON menu_items
  FOR ALL USING (
    is_super_admin() OR is_tenant_member(tenant_id)
  );

-- ─── BURGER_COMPONENTS ──────────────────────────────────────────────────────

-- Public can read available components for active tenants
CREATE POLICY "burger_components_select_public" ON burger_components
  FOR SELECT USING (
    is_available = true
    AND EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND is_active = true)
  );

-- Tenant members can manage components
CREATE POLICY "burger_components_tenant_member" ON burger_components
  FOR ALL USING (
    is_super_admin() OR is_tenant_member(tenant_id)
  );

-- ─── TABLES ─────────────────────────────────────────────────────────────────

-- Public can read active tables (for QR scanning)
CREATE POLICY "tables_select_public" ON tables
  FOR SELECT USING (is_active = true);

-- Tenant members can manage tables
CREATE POLICY "tables_tenant_member" ON tables
  FOR ALL USING (
    is_super_admin() OR is_tenant_member(tenant_id)
  );

-- ─── ORDERS ─────────────────────────────────────────────────────────────────

-- Customers can read their own orders
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT USING (user_id = auth.uid());

-- Tenant members can read/manage all orders for their tenant
CREATE POLICY "orders_tenant_member" ON orders
  FOR ALL USING (
    is_super_admin() OR is_tenant_member(tenant_id)
  );

-- Allow anonymous orders (for QR/table ordering without login)
CREATE POLICY "orders_insert_anon" ON orders
  FOR INSERT WITH CHECK (user_id IS NULL);

-- ─── TENANT_SETTINGS ────────────────────────────────────────────────────────

-- Public can read settings for active tenants
CREATE POLICY "tenant_settings_select_public" ON tenant_settings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND is_active = true)
  );

-- Tenant members can manage settings
CREATE POLICY "tenant_settings_tenant_member" ON tenant_settings
  FOR ALL USING (
    is_super_admin() OR is_tenant_member(tenant_id)
  );

-- ─── PAGES ──────────────────────────────────────────────────────────────────

-- Public can read published pages
CREATE POLICY "pages_select_public" ON pages
  FOR SELECT USING (is_published = true);

-- Tenant members can manage pages
CREATE POLICY "pages_tenant_member" ON pages
  FOR ALL USING (
    is_super_admin() OR is_tenant_member(tenant_id)
  );

-- ─── PAGE_BLOCKS ────────────────────────────────────────────────────────────

-- Public can read blocks for published pages
CREATE POLICY "page_blocks_select_public" ON page_blocks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pages WHERE id = page_id AND is_published = true)
  );

-- Tenant members can manage blocks (via page ownership)
CREATE POLICY "page_blocks_tenant_member" ON page_blocks
  FOR ALL USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM pages p
      WHERE p.id = page_id
      AND is_tenant_member(p.tenant_id)
    )
  );

-- ─── MEDIA ──────────────────────────────────────────────────────────────────

-- Public can read media for active tenants
CREATE POLICY "media_select_public" ON media
  FOR SELECT USING (
    tenant_id IS NULL OR
    EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND is_active = true)
  );

-- Tenant members can manage their media
CREATE POLICY "media_tenant_member" ON media
  FOR ALL USING (
    is_super_admin() OR
    (tenant_id IS NOT NULL AND is_tenant_member(tenant_id)) OR
    (tenant_id IS NULL AND uploaded_by = auth.uid())
  );

-- ─── PROMOTIONS ─────────────────────────────────────────────────────────────

-- Tenant members can manage promotions
CREATE POLICY "promotions_tenant_member" ON promotions
  FOR ALL USING (
    is_super_admin() OR is_tenant_member(tenant_id)
  );

-- ─── FAVORITES ──────────────────────────────────────────────────────────────

-- Users can manage their own favorites
CREATE POLICY "favorites_own" ON favorites
  FOR ALL USING (user_id = auth.uid());

-- ─── SEARCH_HISTORY ─────────────────────────────────────────────────────────

-- Users can manage their own search history
CREATE POLICY "search_history_own" ON search_history
  FOR ALL USING (user_id = auth.uid());

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_tenant_settings_updated_at ON tenant_settings;
CREATE TRIGGER update_tenant_settings_updated_at
  BEFORE UPDATE ON tenant_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_page_blocks_updated_at ON page_blocks;
CREATE TRIGGER update_page_blocks_updated_at
  BEFORE UPDATE ON page_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- REALTIME (for order tracking)
-- =============================================================================

-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
