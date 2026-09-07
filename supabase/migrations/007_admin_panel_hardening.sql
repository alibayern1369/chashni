-- =============================================================================
-- CHASHNI — Migration 007: Admin panel hardening
-- - Owner/admin (not only owner) can update tenant profile
-- - Super-admin can update any tenant
-- - Reservations insert still public for guests, but requires non-empty guest_name
-- =============================================================================

DROP POLICY IF EXISTS "tenants_owner_update" ON tenants;
DROP POLICY IF EXISTS "tenants_admin_update" ON tenants;
CREATE POLICY "tenants_admin_update" ON tenants
  FOR UPDATE USING (
    is_super_admin()
    OR EXISTS (
      SELECT 1 FROM tenant_members
      WHERE user_id = auth.uid()
        AND tenant_id = tenants.id
        AND role IN ('owner', 'admin')
        AND is_active = true
    )
  );

DROP POLICY IF EXISTS "reservations_insert" ON reservations;
CREATE POLICY "reservations_insert" ON reservations
  FOR INSERT WITH CHECK (
    char_length(trim(guest_name)) >= 2
    AND party_size BETWEEN 1 AND 50
  );
