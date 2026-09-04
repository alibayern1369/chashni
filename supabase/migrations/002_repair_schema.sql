-- =============================================================================
-- CHASHNI — Repair Migration 002
-- =============================================================================
-- FIX: Original migration 001 failed at `CREATE OR REPLACE TRIGGER` line
-- because PostgreSQL does NOT support `CREATE OR REPLACE TRIGGER`.
-- This idempotent repair script creates all missing objects.
-- Safe to run multiple times — uses IF NOT EXISTS everywhere.
-- =============================================================================

-- ─── 1. Fix the trigger (drop if exists, then recreate) ─────────────────────

-- First drop the trigger if it was partially created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger correctly (not CREATE OR REPLACE)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── 2. TENANT_MEMBERS ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tenant_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'staff', 'kitchen')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant ON tenant_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_user ON tenant_members(user_id);

-- ─── 3. CATEGORIES ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
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

CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id);

-- ─── 4. MENU_ITEMS ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name_fa TEXT NOT NULL,
  name_en TEXT NOT NULL,
  desc_fa TEXT,
  desc_en TEXT,
  base_price INT NOT NULL DEFAULT 0,
  image TEXT,
  calories INT DEFAULT 0,
  rating NUMERIC(3,1) DEFAULT 0,
  review_count INT DEFAULT 0,
  preparation_time INT DEFAULT 10,
  spicy_level INT DEFAULT 0 CHECK (spicy_level BETWEEN 0 AND 5),
  is_vegetarian BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_chef_pick BOOLEAN DEFAULT false,
  ingredients JSONB DEFAULT '[]'::JSONB,
  allergens JSONB DEFAULT '[]'::JSONB,
  options JSONB DEFAULT '[]'::JSONB,
  extras JSONB DEFAULT '[]'::JSONB,
  available BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_menu_items_tenant ON menu_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(tenant_id, available);

-- Text search index (may fail on some Supabase plans, that's OK)
DO $$ BEGIN
  CREATE INDEX idx_menu_items_search ON menu_items USING gin (
    to_tsvector('simple', name_fa || ' ' || name_en || ' ' || COALESCE(desc_fa, '') || ' ' || COALESCE(desc_en, ''))
  );
EXCEPTION WHEN others THEN NULL;
END $$;

-- ─── 5. BURGER_COMPONENTS ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS burger_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('bun', 'patty', 'cheese', 'toppings', 'sauce')),
  component_id TEXT NOT NULL,
  name_fa TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price INT DEFAULT 0,
  calories INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, category, component_id)
);

CREATE INDEX IF NOT EXISTS idx_burger_components_tenant ON burger_components(tenant_id);
CREATE INDEX IF NOT EXISTS idx_burger_components_category ON burger_components(tenant_id, category);

-- ─── 6. TABLES ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  number INT NOT NULL,
  name TEXT,
  capacity INT DEFAULT 4,
  qr_token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, number)
);

CREATE INDEX IF NOT EXISTS idx_tables_tenant ON tables(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tables_qr_token ON tables(qr_token);

-- ─── 7. ORDERS ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_number SERIAL,
  user_id UUID REFERENCES auth.users(id),
  table_id UUID REFERENCES tables(id),
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN (
    'received', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'
  )),
  order_type TEXT NOT NULL DEFAULT 'dine-in' CHECK (order_type IN ('dine-in', 'takeaway', 'delivery')),
  items JSONB NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_id);

-- ─── 8. TENANT_SETTINGS ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tenant_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, key)
);

CREATE INDEX IF NOT EXISTS idx_tenant_settings_tenant ON tenant_settings(tenant_id);

-- ─── 9. PAGES ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pages (
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

CREATE INDEX IF NOT EXISTS idx_pages_tenant ON pages(tenant_id);

-- ─── 10. PAGE_BLOCKS ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS page_blocks (
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

CREATE INDEX IF NOT EXISTS idx_page_blocks_page ON page_blocks(page_id);

-- ─── 11. MEDIA ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS media (
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

CREATE INDEX IF NOT EXISTS idx_media_tenant ON media(tenant_id);

-- ─── 12. PROMOTIONS ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS promotions (
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

CREATE INDEX IF NOT EXISTS idx_promotions_tenant ON promotions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(tenant_id, code);

-- ─── 13. FAVORITES ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, menu_item_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_tenant ON favorites(tenant_id);

-- ─── 14. SEARCH_HISTORY ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);

-- =============================================================================
-- RLS HELPER FUNCTIONS (CREATE OR REPLACE is safe here)
-- =============================================================================

CREATE OR REPLACE FUNCTION get_user_tenants()
RETURNS SETOF UUID AS $$
  SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

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

CREATE OR REPLACE FUNCTION is_tenant_member(tenant UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_members
    WHERE user_id = auth.uid()
    AND tenant_id = tenant
    AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

DO $$ BEGIN
  ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE burger_components ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE media ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Also ensure tenants + profiles RLS is on (it was from migration 001)
DO $$ BEGIN
  ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- RLS POLICIES (use DO blocks to avoid errors if they already exist)
-- =============================================================================

-- ─── TENANTS ────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE POLICY "tenants_select_public" ON tenants
    FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "tenants_super_admin_all" ON tenants
    FOR ALL USING (is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "tenants_owner_update" ON tenants
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM tenant_members
        WHERE user_id = auth.uid() AND tenant_id = tenants.id AND role = 'owner'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── PROFILES ───────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "profiles_super_admin_all" ON profiles
    FOR ALL USING (is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── TENANT_MEMBERS ─────────────────────────────────────────────────────────

DO $$ BEGIN
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
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "tenant_members_own" ON tenant_members
    FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── CATEGORIES ─────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE POLICY "categories_select_public" ON categories
    FOR SELECT USING (
      is_visible = true
      AND EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND is_active = true)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "categories_tenant_admin" ON categories
    FOR ALL USING (
      is_super_admin() OR is_tenant_member(tenant_id)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── MENU_ITEMS ─────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE POLICY "menu_items_select_public" ON menu_items
    FOR SELECT USING (
      available = true
      AND EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND is_active = true)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "menu_items_tenant_member" ON menu_items
    FOR ALL USING (
      is_super_admin() OR is_tenant_member(tenant_id)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── BURGER_COMPONENTS ──────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE POLICY "burger_components_select_public" ON burger_components
    FOR SELECT USING (
      is_available = true
      AND EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND is_active = true)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "burger_components_tenant_member" ON burger_components
    FOR ALL USING (
      is_super_admin() OR is_tenant_member(tenant_id)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── TABLES ─────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE POLICY "tables_select_public" ON tables
    FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "tables_tenant_member" ON tables
    FOR ALL USING (
      is_super_admin() OR is_tenant_member(tenant_id)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── ORDERS ─────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE POLICY "orders_select_own" ON orders
    FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "orders_tenant_member" ON orders
    FOR ALL USING (
      is_super_admin() OR is_tenant_member(tenant_id)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "orders_insert_anon" ON orders
    FOR INSERT WITH CHECK (user_id IS NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── TENANT_SETTINGS ────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE POLICY "tenant_settings_select_public" ON tenant_settings
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND is_active = true)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "tenant_settings_tenant_member" ON tenant_settings
    FOR ALL USING (
      is_super_admin() OR is_tenant_member(tenant_id)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── PAGES ──────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE POLICY "pages_select_public" ON pages
    FOR SELECT USING (is_published = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "pages_tenant_member" ON pages
    FOR ALL USING (
      is_super_admin() OR is_tenant_member(tenant_id)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── PAGE_BLOCKS ────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE POLICY "page_blocks_select_public" ON page_blocks
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM pages WHERE id = page_id AND is_published = true)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "page_blocks_tenant_member" ON page_blocks
    FOR ALL USING (
      is_super_admin() OR
      EXISTS (
        SELECT 1 FROM pages p
        WHERE p.id = page_id
        AND is_tenant_member(p.tenant_id)
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── MEDIA ──────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE POLICY "media_select_public" ON media
    FOR SELECT USING (
      tenant_id IS NULL OR
      EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND is_active = true)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "media_tenant_member" ON media
    FOR ALL USING (
      is_super_admin() OR
      (tenant_id IS NOT NULL AND is_tenant_member(tenant_id)) OR
      (tenant_id IS NULL AND uploaded_by = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── PROMOTIONS ─────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE POLICY "promotions_tenant_member" ON promotions
    FOR ALL USING (
      is_super_admin() OR is_tenant_member(tenant_id)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── FAVORITES ──────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE POLICY "favorites_own" ON favorites
    FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── SEARCH_HISTORY ─────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE POLICY "search_history_own" ON search_history
    FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- UPDATED_AT TRIGGERS (safe with CREATE OR REPLACE for functions)
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Use DROP + CREATE for triggers (OR REPLACE is not valid for triggers)
DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
  CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
  CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
  CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
  CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
  CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_tenant_settings_updated_at ON tenant_settings;
  CREATE TRIGGER update_tenant_settings_updated_at
    BEFORE UPDATE ON tenant_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
  CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_page_blocks_updated_at ON page_blocks;
  CREATE TRIGGER update_page_blocks_updated_at
    BEFORE UPDATE ON page_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN others THEN NULL;
END $$;

-- =============================================================================
-- REALTIME
-- =============================================================================

-- Enable realtime on orders (safe to re-add)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
