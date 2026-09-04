-- =============================================================================
-- CHASHNI — Migration 003: Deterministic Persian text fix
-- =============================================================================
-- Fixes Persian (and hex) values that were stored as '?????' due to client/
-- editor encoding issues. Uses convert_from(decode(hex,'hex'),'UTF8') which is
-- 100% independent of SQL Editor encoding or standard_conforming_strings.
-- Idempotent — safe to run more than once.
-- =============================================================================

-- Helper: decode a UTF-8 hex literal into text
CREATE OR REPLACE FUNCTION public.utf8_hex(h TEXT)
RETURNS TEXT AS $$
  SELECT convert_from(decode(h, 'hex'), 'UTF8');
$$ LANGUAGE sql IMMUTABLE;

-- ─── 1. FIX TENANT (CHASHNI) ────────────────────────────────────────────────
UPDATE tenants
SET
  name_fa    = public.utf8_hex('da86d8a7d8b4d986db8c'), -- چاشنی
  slogan_fa  = public.utf8_hex('d8b7d8b9d985db8c20daa9d98720d981d8b1d8a7d985d988d8b4d8b420d986d985db8cdaa9d986db8c'), -- طعمی که فراموشش نمیکنی
  address_fa = public.utf8_hex('d8aad987d8b1d8a7d986d88c20d8aedb8cd8a7d8a8d8a7d98620d988d984db8cd8b9d8b5d8b1d88c20d986d8a8d8b420daa9d988da86d98720daafd984d8b3d8aad8a7d986d88c20d9bed984d8a7daa920313230') -- تهران، خیابان ولیعصر، نبش کوچه گلستان، پلاک 120
WHERE slug = 'chashni';

-- ─── 2. FIX CATEGORIES if they were stored corrupted ────────────────────────
UPDATE categories SET name_fa = public.utf8_hex('d9bedb8cd8b4d986d987d8a7d8af20d8b3d8b1d8a2d8b4d9bed8b2') WHERE slug = 'chef-picks' AND name_fa = '?????';
UPDATE categories SET name_fa = public.utf8_hex('d8a8d8b1daafd8b1') WHERE slug = 'burgers' AND name_fa = '?????';
UPDATE categories SET name_fa = public.utf8_hex('d985d8b1d8ba') WHERE slug = 'chicken' AND name_fa = '?????';
UPDATE categories SET name_fa = public.utf8_hex('d9bedb8cd8aad8b2d8a7') WHERE slug = 'pizza' AND name_fa = '?????';
UPDATE categories SET name_fa = public.utf8_hex('d8b3d8a7db8cd8af') WHERE slug = 'sides' AND name_fa = '?????';
UPDATE categories SET name_fa = public.utf8_hex('d8b3d8a7d984d8a7d8af') WHERE slug = 'salads' AND name_fa = '?????';
UPDATE categories SET name_fa = public.utf8_hex('d986d988d8b4db8cd8afd986db8c') WHERE slug = 'drinks' AND name_fa = '?????';
UPDATE categories SET name_fa = public.utf8_hex('d985db8cd984daa920d8b4db8cdaa9') WHERE slug = 'milkshakes' AND name_fa = '?????';
UPDATE categories SET name_fa = public.utf8_hex('d8afd8b3d8b1') WHERE slug = 'desserts' AND name_fa = '?????';

-- ─── 3. VERIFY ──────────────────────────────────────────────────────────────
SELECT slug, name_fa, slogan_fa, address_fa FROM tenants WHERE slug = 'chashni';

-- ─── 4. CLEANUP (optional, keep the helper for future seeds) ────────────────
-- DROP FUNCTION public.utf8_hex(TEXT); -- uncomment to remove after verifying