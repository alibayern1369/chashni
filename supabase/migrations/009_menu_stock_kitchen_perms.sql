-- =============================================================================
-- CHASHNI — Migration 009: Menu stock + kitchen advance permission
-- =============================================================================

ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS stock_qty INT NULL
  CHECK (stock_qty IS NULL OR stock_qty >= 0);

COMMENT ON COLUMN menu_items.stock_qty IS 'NULL = unlimited stock; 0 = sold out';

ALTER TABLE tenant_members
  ADD COLUMN IF NOT EXISTS kitchen_can_advance BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN tenant_members.kitchen_can_advance IS
  'When role=kitchen: true = can advance order status; false = view-only queue';
