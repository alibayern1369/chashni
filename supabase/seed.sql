-- =============================================================================
-- CHASHNI — Seed Data (Idempotent, UTF-8 Safe)
-- =============================================================================
-- Run AFTER 002_repair_schema.sql.
-- Uses DELETE+INSERT to be re-runnable.
-- NOTE: Persian characters require UTF-8 encoding in the SQL Editor.
-- If you see ??? for Persian text, paste via the file with UTF-8 encoding.
-- =============================================================================

-- ─── 1. UPDATE EXISTING TENANT ──────────────────────────────────────────────

UPDATE tenants
SET
  name_fa = E'\u0686\u0627\u0634\u0646\u06CC',
  name_en = 'CHASHNI',
  slogan_fa = E'\u0637\u0639\u0645\u06CC \u06A9\u0647 \u0641\u0631\u0627\u0645\u0648\u0634\u0634 \u0646\u0645\u06CC\u200C\u06A9\u0646\u06CC',
  slogan_en = 'A Taste You Won''t Forget',
  phone = '021-88881234',
  address_fa = E'\u062A\u0647\u0631\u0627\u0646\u060C \u062E\u06CC\u0627\u0628\u0627\u0646 \u0648\u0644\u06CC\u0639\u0635\u0631\u060C \u0646\u0628\u0634 \u06A9\u0648\u0686\u0647 \u06AF\u0644\u0633\u062A\u0627\u0646\u060C \u067E\u0644\u0627\u06A9 120',
  address_en = 'No. 120, Valiasr St. corner of Golestan Alley, Tehran',
  enabled_modules = ARRAY['menu','orders','tables']::TEXT[]
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- ─── 2. DELETE OLD SEED DATA (if any) ───────────────────────────────────────

DELETE FROM burger_components WHERE tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM menu_items WHERE tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM categories WHERE tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM tenant_settings WHERE tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM tables WHERE tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- ─── 3. CATEGORIES ──────────────────────────────────────────────────────────

INSERT INTO categories (tenant_id, slug, name_fa, name_en, icon, sort_order) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'chef-picks', E'\u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0633\u0631\u0622\u0634\u067E\u0632', 'Chef''s Picks', E'\uD83D\uDC68\u200D\uD83C\uDF73', 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'burgers', E'\u0628\u0631\u06AF\u0631', 'Burgers', E'\uD83C\uDF54', 2),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'chicken', E'\u0645\u0631\u063A', 'Chicken', E'\uD83C\uDF57', 3),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'pizza', E'\u067E\u06CC\u062A\u0632\u0627', 'Pizza', E'\uD83C\uDF55', 4),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'sides', E'\u0633\u0627\u06CC\u062F', 'Sides', E'\uD83C\uDF5F', 5),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'salads', E'\u0633\u0627\u0644\u0627\u062F', 'Salads', E'\uD83E\uDD57', 6),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'drinks', E'\u0646\u0648\u0634\u06CC\u062F\u0646\u06CC', 'Drinks', E'\uD83E\uDD64', 7),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'desserts', E'\u062F\u0633\u0631', 'Desserts', E'\uD83C\uDF70', 8),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'combos', E'\u06A9\u0645\u0628\u0627\u06CC\u0646', 'Combos', E'\uD83C\uDF89', 9);

-- ─── 4. MENU ITEMS ──────────────────────────────────────────────────────────
-- Get category IDs and insert menu items

DO $$
DECLARE
  t_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  cat_chef UUID;
  cat_burgers UUID;
  cat_sides UUID;
  cat_drinks UUID;
  cat_desserts UUID;
  cat_combos UUID;
  b_options JSONB := '[{"id":"opt-patty","nameFa":"Patty","nameEn":"Patty","type":"radio","required":true,"options":[{"id":"patty-beef","nameFa":"Beef","nameEn":"Beef","priceModifier":0},{"id":"patty-double","nameFa":"Double Beef","nameEn":"Double Beef","priceModifier":65000},{"id":"patty-chicken","nameFa":"Chicken","nameEn":"Chicken","priceModifier":0},{"id":"patty-plant","nameFa":"Plant","nameEn":"Plant-based","priceModifier":35000}]},{"id":"opt-bun","nameFa":"Bun","nameEn":"Bun","type":"radio","required":true,"options":[{"id":"bun-brioche","nameFa":"Brioche","nameEn":"Brioche","priceModifier":0},{"id":"bun-sesame","nameFa":"Sesame","nameEn":"Sesame","priceModifier":0},{"id":"bun-whole","nameFa":"Whole Wheat","nameEn":"Whole Wheat","priceModifier":12000}]},{"id":"opt-cheese","nameFa":"Cheese","nameEn":"Cheese","type":"radio","required":true,"options":[{"id":"cheese-cheddar","nameFa":"Cheddar","nameEn":"Cheddar","priceModifier":0},{"id":"cheese-swiss","nameFa":"Swiss","nameEn":"Swiss","priceModifier":22000},{"id":"cheese-jack","nameFa":"Pepper Jack","nameEn":"Pepper Jack","priceModifier":22000}]}]';
  b_extras JSONB := '[{"id":"extra-bacon","nameFa":"Bacon","nameEn":"Bacon","price":28000,"calories":80},{"id":"extra-mushroom","nameFa":"Mushroom","nameEn":"Mushroom","price":18000,"calories":15},{"id":"extra-jalapeno","nameFa":"Jalapeno","nameEn":"Jalapeno","price":8000,"calories":5},{"id":"extra-caramelized","nameFa":"Caramelized Onion","nameEn":"Caramelized Onion","price":15000,"calories":30},{"id":"extra-truffle","nameFa":"Truffle","nameEn":"Truffle","price":35000,"calories":40},{"id":"extra-egg","nameFa":"Fried Egg","nameEn":"Fried Egg","price":15000,"calories":90}]';
BEGIN
  SELECT id INTO cat_chef FROM categories WHERE slug='chef-picks' AND tenant_id=t_id;
  SELECT id INTO cat_burgers FROM categories WHERE slug='burgers' AND tenant_id=t_id;
  SELECT id INTO cat_sides FROM categories WHERE slug='sides' AND tenant_id=t_id;
  SELECT id INTO cat_drinks FROM categories WHERE slug='drinks' AND tenant_id=t_id;
  SELECT id INTO cat_desserts FROM categories WHERE slug='desserts' AND tenant_id=t_id;
  SELECT id INTO cat_combos FROM categories WHERE slug='combos' AND tenant_id=t_id;

  -- Chef's Picks
  INSERT INTO menu_items (tenant_id,category_id,slug,name_fa,name_en,desc_fa,desc_en,base_price,image,calories,rating,review_count,preparation_time,spicy_level,is_vegetarian,is_bestseller,is_new,is_chef_pick,ingredients,allergens,options,extras,sort_order) VALUES
  (t_id,cat_chef,'truffle-smash','Truffle Smash','Truffle Smash','Truffle Smash Burger with double beef, cheddar, truffle aioli, caramelized onion on brioche','Double beef smash patty with melted cheddar, truffle aioli, caramelized onion and rosemary on brioche',489000,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop',920,4.9,342,18,1,false,true,false,true,'[{"fa":"Beef","en":"Beef"},{"fa":"Cheddar","en":"Cheddar"},{"fa":"Truffle Aioli","en":"Truffle Aioli"},{"fa":"Caramelized Onion","en":"Caramelized Onion"},{"fa":"Rosemary","en":"Rosemary"},{"fa":"Brioche Bun","en":"Brioche Bun"}]'::JSONB,'[{"fa":"Gluten","en":"Gluten"},{"fa":"Dairy","en":"Dairy"},{"fa":"Egg","en":"Egg"}]'::JSONB,b_options,b_extras,1);

  INSERT INTO menu_items (tenant_id,category_id,slug,name_fa,name_en,desc_fa,desc_en,base_price,image,calories,rating,review_count,preparation_time,spicy_level,is_vegetarian,is_bestseller,is_new,is_chef_pick,ingredients,allergens,options,extras,sort_order) VALUES
  (t_id,cat_chef,'volcanic-wings','Volcanic Wings','Volcanic Wings','Crispy chicken wings with volcanic hot sauce and ranch','Crispy chicken wings tossed in volcanic hot sauce, served with cool ranch dip',329000,'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop',680,4.8,256,15,3,false,true,false,true,'[{"fa":"Chicken Wings","en":"Chicken Wings"},{"fa":"Volcanic Hot Sauce","en":"Volcanic Hot Sauce"},{"fa":"Ranch Dip","en":"Ranch Dip"}]'::JSONB,'[{"fa":"Dairy","en":"Dairy"},{"fa":"Egg","en":"Egg"},{"fa":"Mustard","en":"Mustard"}]'::JSONB,'[]'::JSONB,'[{"id":"extra-ranch","nameFa":"Extra Ranch","nameEn":"Extra Ranch","price":18000,"calories":80},{"id":"extra-honey","nameFa":"Honey Glaze","nameEn":"Honey Glaze","price":22000,"calories":60}]'::JSONB,2);

  INSERT INTO menu_items (tenant_id,category_id,slug,name_fa,name_en,desc_fa,desc_en,base_price,image,calories,rating,review_count,preparation_time,spicy_level,is_vegetarian,is_bestseller,is_new,is_chef_pick,ingredients,allergens,options,extras,sort_order) VALUES
  (t_id,cat_chef,'the-classic-380','Classic 380','The Classic 380','Classic 380g beef patty with cheddar, lettuce, tomato, onion and special sauce','The good old burger: 380g beef patty, cheddar, lettuce, tomato, onion and special sauce',359000,'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&h=400&fit=crop',850,4.8,521,14,0,false,true,false,true,'[{"fa":"Beef","en":"Beef"},{"fa":"Cheddar","en":"Cheddar"},{"fa":"Lettuce","en":"Lettuce"},{"fa":"Tomato","en":"Tomato"},{"fa":"Onion","en":"Onion"},{"fa":"Special Sauce","en":"Special Sauce"},{"fa":"Brioche Bun","en":"Brioche Bun"}]'::JSONB,'[{"fa":"Gluten","en":"Gluten"},{"fa":"Dairy","en":"Dairy"},{"fa":"Egg","en":"Egg"}]'::JSONB,b_options,b_extras,3);

  -- Burgers
  INSERT INTO menu_items (tenant_id,category_id,slug,name_fa,name_en,desc_fa,desc_en,base_price,image,calories,rating,review_count,preparation_time,spicy_level,is_vegetarian,is_bestseller,is_new,is_chef_pick,ingredients,allergens,options,extras,sort_order) VALUES
  (t_id,cat_burgers,'smash-double','Smash Double','Smash Double','Two thin beef smash patties with melted cheddar, fresh onion and special sauce on brioche','Two thin beef smash patties with melted cheddar, fresh onion and special sauce on brioche',389000,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop',880,4.8,412,14,0,false,true,false,false,'[{"fa":"Beef","en":"Beef"},{"fa":"Cheddar","en":"Cheddar"},{"fa":"Onion","en":"Onion"},{"fa":"Special Sauce","en":"Special Sauce"},{"fa":"Brioche Bun","en":"Brioche Bun"}]'::JSONB,'[{"fa":"Gluten","en":"Gluten"},{"fa":"Dairy","en":"Dairy"},{"fa":"Egg","en":"Egg"}]'::JSONB,b_options,b_extras,1);

  -- Sides
  INSERT INTO menu_items (tenant_id,category_id,slug,name_fa,name_en,desc_fa,desc_en,base_price,image,calories,rating,review_count,preparation_time,spicy_level,is_vegetarian,is_bestseller,is_new,is_chef_pick,ingredients,allergens,options,extras,sort_order) VALUES
  (t_id,cat_sides,'classic-fries','Classic Fries','Classic Fries','Golden crispy fries with sea salt','Golden crispy fries with sea salt',99000,'https://images.unsplash.com/photo-1573080496219-bb080e42ba89?w=600&h=400&fit=crop',380,4.4,456,8,0,true,true,false,false,'[{"fa":"Potato","en":"Potato"},{"fa":"Sea Salt","en":"Sea Salt"},{"fa":"Oil","en":"Oil"}]'::JSONB,'[]'::JSONB,'[{"id":"opt-fries-size","nameFa":"Size","nameEn":"Size","type":"radio","required":true,"options":[{"id":"fries-small","nameFa":"Small","nameEn":"Small","priceModifier":0},{"id":"fries-medium","nameFa":"Medium","nameEn":"Medium","priceModifier":35000},{"id":"fries-large","nameFa":"Large","nameEn":"Large","priceModifier":65000}]}]'::JSONB,'[{"id":"extra-ketchup","nameFa":"Ketchup","nameEn":"Ketchup","price":0,"calories":20},{"id":"extra-mayo","nameFa":"Mayo","nameEn":"Mayo","price":0,"calories":90},{"id":"extra-cheese","nameFa":"Cheese Sauce","nameEn":"Cheese Sauce","price":25000,"calories":110}]'::JSONB,1);

  -- Drinks
  INSERT INTO menu_items (tenant_id,category_id,slug,name_fa,name_en,desc_fa,desc_en,base_price,image,calories,rating,review_count,preparation_time,spicy_level,is_vegetarian,is_bestseller,is_new,is_chef_pick,ingredients,allergens,options,extras,sort_order) VALUES
  (t_id,cat_drinks,'craft-lemonade','Craft Lemonade','Craft Lemonade','Fresh handmade lemonade with mint and honey','Fresh handmade lemonade with mint and honey',89000,'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&h=400&fit=crop',120,4.5,234,5,0,true,true,false,false,'[{"fa":"Lemon","en":"Lemon"},{"fa":"Mint","en":"Mint"},{"fa":"Honey","en":"Honey"},{"fa":"Water","en":"Water"}]'::JSONB,'[]'::JSONB,'[]'::JSONB,'[]'::JSONB,1);

  -- Desserts
  INSERT INTO menu_items (tenant_id,category_id,slug,name_fa,name_en,desc_fa,desc_en,base_price,image,calories,rating,review_count,preparation_time,spicy_level,is_vegetarian,is_bestseller,is_new,is_chef_pick,ingredients,allergens,options,extras,sort_order) VALUES
  (t_id,cat_desserts,'chocolate-lava','Chocolate Lava Cake','Chocolate Lava Cake','Chocolate cake with molten center, served with vanilla ice cream','Chocolate cake with molten chocolate center, served with vanilla ice cream',149000,'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=400&fit=crop',480,4.8,289,12,0,true,true,false,false,'[{"fa":"Chocolate","en":"Chocolate"},{"fa":"Butter","en":"Butter"},{"fa":"Flour","en":"Flour"},{"fa":"Eggs","en":"Eggs"},{"fa":"Sugar","en":"Sugar"},{"fa":"Vanilla Ice Cream","en":"Vanilla Ice Cream"}]'::JSONB,'[{"fa":"Gluten","en":"Gluten"},{"fa":"Dairy","en":"Dairy"},{"fa":"Egg","en":"Egg"}]'::JSONB,'[]'::JSONB,'[{"id":"extra-icecream","nameFa":"Extra Ice Cream","nameEn":"Extra Ice Cream","price":35000,"calories":200},{"id":"extra-cream","nameFa":"Whipped Cream","nameEn":"Whipped Cream","price":15000,"calories":80}]'::JSONB,1);

  -- Combos
  INSERT INTO menu_items (tenant_id,category_id,slug,name_fa,name_en,desc_fa,desc_en,base_price,image,calories,rating,review_count,preparation_time,spicy_level,is_vegetarian,is_bestseller,is_new,is_chef_pick,ingredients,allergens,options,extras,sort_order) VALUES
  (t_id,cat_combos,'classic-combo','Classic Combo','Classic Combo','Classic Burger + Medium Fries + Cola','Classic Burger + Medium Fries + Cola',449000,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop',1370,4.7,345,18,0,false,true,false,false,'[{"fa":"Burger Patty","en":"Burger Patty"},{"fa":"Cheddar","en":"Cheddar"},{"fa":"Fries","en":"Fries"},{"fa":"Cola","en":"Cola"}]'::JSONB,'[{"fa":"Gluten","en":"Gluten"},{"fa":"Dairy","en":"Dairy"},{"fa":"Egg","en":"Egg"}]'::JSONB,'[]'::JSONB,'[{"id":"extra-upsize","nameFa":"Upsize","nameEn":"Upsize Fries","price":35000,"calories":180}]'::JSONB,1);

END $$;

-- ─── 5. TABLES ──────────────────────────────────────────────────────────────

INSERT INTO tables (tenant_id, number, name, capacity, qr_token, is_active)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', n, CASE WHEN n<=2 THEN 'VIP '||n WHEN n=6 THEN 'Family' ELSE NULL END,
  CASE WHEN n<=2 THEN 4 WHEN n=6 THEN 8 ELSE 2 END,
  'CHASHNI-T' || n || '-' || md5(random()::text || n), true
FROM generate_series(1,6) AS n
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE tenant_id='a1b2c3d4-e5f6-7890-abcd-ef1234567890');

-- ─── 6. TENANT SETTINGS ─────────────────────────────────────────────────────

INSERT INTO tenant_settings (tenant_id, key, value)
VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'design', '{"logoEmoji":"burger","designerName":"CHASHNI Studio","designerUrl":"#"}'::JSONB),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'hours', '{"open":"11:00","close":"23:00"}'::JSONB),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'social', '{"instagram":"","telegram":"","whatsapp":""}'::JSONB)
ON CONFLICT (tenant_id, key) DO UPDATE SET value = EXCLUDED.value;

-- ─── 7. BURGER COMPONENTS ───────────────────────────────────────────────────

INSERT INTO burger_components (tenant_id, category, component_id, name_fa, name_en, price, calories, sort_order) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'bun', 'bun-brioche', 'Brioche', 'Brioche', 0, 210, 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'bun', 'bun-pretzel', 'Pretzel', 'Pretzel', 15000, 230, 2),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'bun', 'bun-sesame', 'Sesame', 'Sesame', 0, 200, 3),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'bun', 'bun-whole-wheat', 'Whole Wheat', 'Whole Wheat', 12000, 180, 4),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'patty', 'patty-single', 'Single Beef', 'Single Beef', 0, 320, 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'patty', 'patty-double', 'Double Beef', 'Double Beef', 65000, 640, 2),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'patty', 'patty-chicken', 'Chicken Breast', 'Chicken Breast', 0, 250, 3),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'patty', 'patty-plant', 'Plant-based', 'Plant-based', 35000, 220, 4),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cheese', 'cheese-cheddar', 'Standard Cheddar', 'Standard Cheddar', 0, 110, 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cheese', 'cheese-extra-cheddar', 'Extra Cheddar', 'Extra Cheddar', 18000, 220, 2),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cheese', 'cheese-swiss', 'Swiss', 'Swiss', 22000, 100, 3),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cheese', 'cheese-pepper-jack', 'Pepper Jack', 'Pepper Jack', 22000, 110, 4),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'toppings', 'top-lettuce', 'Lettuce', 'Lettuce', 0, 5, 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'toppings', 'top-tomato', 'Tomato', 'Tomato', 0, 10, 2),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'toppings', 'top-pickles', 'Pickles', 'Pickles', 0, 5, 3),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'toppings', 'top-jalapeno', 'Jalapeno', 'Jalapeno', 8000, 5, 4),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'toppings', 'top-caramelized-onion', 'Caramelized Onion', 'Caramelized Onion', 15000, 30, 5),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'toppings', 'top-mushroom', 'Mushroom', 'Mushroom', 18000, 15, 6),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'toppings', 'top-bacon', 'Bacon-style', 'Bacon-style', 28000, 80, 7),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'toppings', 'top-onion-ring', 'Onion Ring', 'Onion Ring', 18000, 45, 8),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'sauce', 'sauce-chashni', 'CHASHNI Special', 'CHASHNI Special', 0, 60, 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'sauce', 'sauce-ketchup', 'Ketchup', 'Ketchup', 0, 20, 2),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'sauce', 'sauce-mustard', 'Mustard', 'Mustard', 0, 10, 3),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'sauce', 'sauce-mayo', 'Mayo', 'Mayo', 0, 90, 4),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'sauce', 'sauce-bbq', 'BBQ', 'BBQ', 8000, 50, 5),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'sauce', 'sauce-truffle', 'Truffle Aioli', 'Truffle Aioli', 22000, 70, 6)
ON CONFLICT (tenant_id, category, component_id) DO UPDATE SET
  name_fa = EXCLUDED.name_fa, name_en = EXCLUDED.name_en,
  price = EXCLUDED.price, calories = EXCLUDED.calories, sort_order = EXCLUDED.sort_order;
