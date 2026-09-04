-- =============================================================================
-- CHASHNI — Migration 004: Platform completion
-- Payment fields, loyalty, reservations, tighter RLS, promo validate RPC,
-- media storage bucket
-- =============================================================================

-- ─── Orders: payment + delivery + promo + loyalty ───────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT
    CHECK (payment_method IS NULL OR payment_method IN ('online', 'cashier')),
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed', 'refunded')),
  ADD COLUMN IF NOT EXISTS payment_ref TEXT,
  ADD COLUMN IF NOT EXISTS promo_code TEXT,
  ADD COLUMN IF NOT EXISTS delivery_address TEXT,
  ADD COLUMN IF NOT EXISTS loyalty_points_earned INT DEFAULT 0;

-- ─── Admin vs kitchen role helpers (before policies that use them) ──────────
CREATE OR REPLACE FUNCTION is_tenant_admin(tenant UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_members
    WHERE user_id = auth.uid()
      AND tenant_id = tenant
      AND role IN ('owner', 'admin', 'staff')
      AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── Loyalty balances ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loyalty_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_loyalty_tenant_user ON loyalty_balances(tenant_id, user_id);

ALTER TABLE loyalty_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "loyalty_own" ON loyalty_balances;
CREATE POLICY "loyalty_own" ON loyalty_balances
  FOR ALL USING (auth.uid() = user_id OR is_super_admin() OR is_tenant_member(tenant_id));

-- ─── Reservations ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  party_size INT NOT NULL DEFAULT 2,
  reserved_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'seated', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_tenant ON reservations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_at ON reservations(tenant_id, reserved_at);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reservations_select_own" ON reservations;
CREATE POLICY "reservations_select_own" ON reservations
  FOR SELECT USING (
    auth.uid() = user_id OR is_super_admin() OR is_tenant_member(tenant_id)
  );

DROP POLICY IF EXISTS "reservations_insert" ON reservations;
CREATE POLICY "reservations_insert" ON reservations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "reservations_tenant_manage" ON reservations;
CREATE POLICY "reservations_tenant_manage" ON reservations
  FOR ALL USING (is_super_admin() OR is_tenant_admin(tenant_id));

-- Tighten write policies: kitchen cannot edit menu/settings/promos/pages/media/tables
DROP POLICY IF EXISTS "categories_tenant_admin" ON categories;
CREATE POLICY "categories_tenant_admin" ON categories
  FOR ALL USING (is_super_admin() OR is_tenant_admin(tenant_id));

DROP POLICY IF EXISTS "menu_items_tenant_member" ON menu_items;
CREATE POLICY "menu_items_tenant_admin" ON menu_items
  FOR ALL USING (is_super_admin() OR is_tenant_admin(tenant_id));

DROP POLICY IF EXISTS "burger_components_tenant_member" ON burger_components;
CREATE POLICY "burger_components_tenant_admin" ON burger_components
  FOR ALL USING (is_super_admin() OR is_tenant_admin(tenant_id));

DROP POLICY IF EXISTS "tables_tenant_member" ON tables;
CREATE POLICY "tables_tenant_admin" ON tables
  FOR ALL USING (is_super_admin() OR is_tenant_admin(tenant_id));

DROP POLICY IF EXISTS "tenant_settings_tenant_member" ON tenant_settings;
CREATE POLICY "tenant_settings_tenant_admin" ON tenant_settings
  FOR ALL USING (is_super_admin() OR is_tenant_admin(tenant_id));

DROP POLICY IF EXISTS "pages_tenant_member" ON pages;
CREATE POLICY "pages_tenant_admin" ON pages
  FOR ALL USING (is_super_admin() OR is_tenant_admin(tenant_id));

DROP POLICY IF EXISTS "page_blocks_tenant_member" ON page_blocks;
CREATE POLICY "page_blocks_tenant_admin" ON page_blocks
  FOR ALL USING (
    is_super_admin() OR EXISTS (
      SELECT 1 FROM pages p
      WHERE p.id = page_blocks.page_id AND is_tenant_admin(p.tenant_id)
    )
  );

DROP POLICY IF EXISTS "media_tenant_member" ON media;
CREATE POLICY "media_tenant_admin" ON media
  FOR ALL USING (
    is_super_admin() OR
    (tenant_id IS NOT NULL AND is_tenant_admin(tenant_id))
  );

DROP POLICY IF EXISTS "promotions_tenant_member" ON promotions;
CREATE POLICY "promotions_tenant_admin" ON promotions
  FOR ALL USING (is_super_admin() OR is_tenant_admin(tenant_id));

-- Active promotions readable for checkout validation (code only via RPC preferred)
DROP POLICY IF EXISTS "promotions_select_active" ON promotions;
CREATE POLICY "promotions_select_active" ON promotions
  FOR SELECT USING (
    is_active = true
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW())
  );

-- Kitchen can still manage orders
DROP POLICY IF EXISTS "orders_tenant_member" ON orders;
CREATE POLICY "orders_tenant_member" ON orders
  FOR ALL USING (is_super_admin() OR is_tenant_member(tenant_id));

-- ─── Promo validation RPC (increments use count atomically) ─────────────────
CREATE OR REPLACE FUNCTION apply_promotion(
  p_tenant_id UUID,
  p_code TEXT,
  p_subtotal INT
)
RETURNS TABLE (
  discount INT,
  promo_id UUID,
  code TEXT
) AS $$
DECLARE
  promo promotions%ROWTYPE;
  computed INT;
BEGIN
  SELECT * INTO promo FROM promotions
  WHERE tenant_id = p_tenant_id
    AND upper(code) = upper(p_code)
    AND is_active = true
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW())
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid promo code';
  END IF;

  IF promo.max_uses IS NOT NULL AND promo.used_count >= promo.max_uses THEN
    RAISE EXCEPTION 'Promo code exhausted';
  END IF;

  IF p_subtotal < COALESCE(promo.min_order, 0) THEN
    RAISE EXCEPTION 'Order below minimum for promo';
  END IF;

  IF promo.discount_type = 'percentage' THEN
    computed := (p_subtotal * promo.discount_value) / 100;
  ELSE
    computed := promo.discount_value;
  END IF;

  IF computed > p_subtotal THEN
    computed := p_subtotal;
  END IF;

  UPDATE promotions SET used_count = used_count + 1 WHERE id = promo.id;

  discount := computed;
  promo_id := promo.id;
  code := promo.code;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Storage bucket for media ───────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "media_bucket_public_read" ON storage.objects;
CREATE POLICY "media_bucket_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "media_bucket_auth_upload" ON storage.objects;
CREATE POLICY "media_bucket_auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "media_bucket_auth_update" ON storage.objects;
CREATE POLICY "media_bucket_auth_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "media_bucket_auth_delete" ON storage.objects;
CREATE POLICY "media_bucket_auth_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');
