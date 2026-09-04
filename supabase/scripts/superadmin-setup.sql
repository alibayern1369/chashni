-- ═══════════════════════════════════════════════════════════════════════════════
-- CHASHNI — Prefer using the app bootstrap:
--   1) Open /fa/login
--   2) Click «ساخت ادمین: admin / admin» if shown
-- Or create users from Super Admin → Users.
--
-- This SQL only promotes an EXISTING auth user by username/email.
-- ═══════════════════════════════════════════════════════════════════════════════

do $$
  declare _uid uuid;
  declare _login text := 'admin'; -- change if needed
begin
  select id into _uid
  from auth.users
  where email = _login || '@chashni.local' or email = _login
  limit 1;

  if _uid is null then
    raise notice 'User not found — use /fa/login bootstrap or Super Admin UI.';
    return;
  end if;

  insert into public.profiles (id, email, username, full_name, role, is_active)
  values (_uid, _login || '@chashni.local', _login, 'Super Admin', 'super_admin', true)
  on conflict (id) do update
    set role = 'super_admin', is_active = true, username = excluded.username;

  insert into tenant_members (id, tenant_id, user_id, role, is_active)
  select gen_random_uuid(), t.id, _uid, 'owner', true
  from tenants t
  where t.slug = 'chashni'
  on conflict do nothing;
end $$;
