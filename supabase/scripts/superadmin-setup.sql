-- ═══════════════════════════════════════════════════════════════════════════════
-- CHASHNI — Super Admin Setup
-- Run this in Supabase SQL Editor AFTER creating your account.
--
-- 1) Promote YOUR user to super_admin (replace the email below).
-- 2) Make you an admin of the CHASHNI tenant (via tenant_members).
-- 3) Sanity-check rows exist.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1) Set YOUR role to super_admin ───────────────────────────────────────────
do $$
  declare _uid uuid;
begin
  select id into _uid
  from auth.users
  where email = 'alibayern1369@gmail.com'
  limit 1;

  if _uid is null then
    raise notice 'User with email not found — create the account first.';
    return;
  end if;

  insert into profiles (id, email, full_name, role, is_active)
  values (_uid, 'alibayern1369@gmail.com', null, 'super_admin', true)
  on conflict (id) do update set role = 'super_admin', is_active = true;
end $$;

-- ── 2) Join you as admin of the CHASHNI tenant ────────────────────────────────
insert into tenant_members (id, tenant_id, user_id, role, is_active)
select gen_random_uuid(), t.id, p.id, 'admin', true
from tenants t, profiles p
where t.slug = 'chashni' and p.role = 'super_admin'
on conflict do nothing;

-- ── 3) Sanity checks ──────────────────────────────────────────────────────────
select id, email, role, is_active from profiles where role = 'super_admin';
select tm.id, t.slug, p.email, tm.role
from tenant_members tm
join tenants t on t.id = tm.tenant_id
join profiles p on p.id = tm.user_id;