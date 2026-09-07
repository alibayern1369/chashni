-- =============================================================================
-- CHASHNI — Migration 006: Allow customer order inserts under RLS
-- =============================================================================
-- Problem: orders_insert_anon only allowed user_id IS NULL, so logged-in
-- customers (auth.uid() set) could not place orders.
-- Also ensure guest inserts remain allowed for QR/table ordering.
-- =============================================================================

DROP POLICY IF EXISTS "orders_insert_anon" ON orders;
DROP POLICY IF EXISTS "orders_insert_customer" ON orders;

-- Guests (no auth) OR the authenticated customer themselves may insert.
CREATE POLICY "orders_insert_customer" ON orders
  FOR INSERT
  WITH CHECK (
    user_id IS NULL
    OR user_id = auth.uid()
  );

-- Customers can update only their own unpaid/pending orders notes (optional safety)
-- Keep select own + tenant member policies as-is.
