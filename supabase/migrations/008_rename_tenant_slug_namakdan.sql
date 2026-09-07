-- =============================================================================
-- CHASHNI — Migration 008: Restaurant slug = namakdan (not platform name)
-- Platform = CHASHNI · Restaurant tenant = Namakdan
-- =============================================================================

UPDATE tenants
SET slug = 'namakdan',
    updated_at = NOW()
WHERE slug = 'chashni'
   OR id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
