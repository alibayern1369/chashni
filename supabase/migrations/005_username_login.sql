-- =============================================================================
-- CHASHNI — Migration 005: Username login
-- =============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique
  ON profiles (lower(username))
  WHERE username IS NOT NULL;

-- Keep profile in sync with username from user metadata / synthetic email
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  uname TEXT;
BEGIN
  uname := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'username', '')), '');
  IF uname IS NULL AND NEW.email LIKE '%@chashni.local' THEN
    uname := split_part(NEW.email, '@', 1);
  END IF;

  INSERT INTO public.profiles (id, email, full_name, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    uname,
    'customer'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    username = COALESCE(EXCLUDED.username, profiles.username);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
