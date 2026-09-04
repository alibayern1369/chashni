# CHASHNI — Link Map

Complete URL map for the platform. Each section is independent.

Base URL examples use local `http://localhost:3000`. Replace with your deployed host.

---

## 1) Super Admin — restaurants & users

| Label | Path |
|--------|------|
| Super dashboard | `/fa/admin/super` |
| Tenants (create restaurants + toggle modules) | `/fa/admin/super/tenants` |
| Users & roles | `/fa/admin/super/users` |

Requires a profile with `role = super_admin`. Login with **username + password** at `/fa/login`.

First-time setup: if no super admin exists, the login page offers **Create admin / admin**.

Super admin can create users and reset passwords at `/fa/admin/super/users`.

**Modules toggled per tenant:** `menu`, `orders`, `tables`, `builder`, `favorites`, `cms`, `payment`, `delivery`, `loyalty`, `reservations`, `auth`.

---

## 2) Customer menu

| Label | Path |
|--------|------|
| Menu (FA) | `/fa/menu` |
| Menu with table context | `/fa/menu?table=07` |
| Menu (EN) | `/en/menu` |
| Build burger | `/fa/build-burger` |
| Favorites | `/fa/favorites` |
| Cart | `/fa/cart` |
| Checkout | `/fa/checkout` |
| My orders | `/fa/my-orders` |
| Order tracking | `/fa/order/{orderId}` |
| Table QR resolve | `/fa/qr/{qr_token}` |
| Reserve table | `/fa/reserve` |

Path-tenant (optional): `/t/{slug}/…` sets tenant via proxy.

---

## 3) Restaurant admin (per tenant)

| Label | Path |
|--------|------|
| Login | `/fa/login` |
| Orders | `/fa/admin` |
| Menu CRUD | `/fa/admin/menu` |
| Kitchen display | `/fa/admin/kitchen` |
| Tables & QR | `/fa/admin/tables` |
| Promotions | `/fa/admin/promotions` |
| Media | `/fa/admin/media` |
| Settings (+ Zarinpal merchant when `payment` on) | `/fa/admin/settings` |
| Reservations | `/fa/admin/reservations` |

Requires `tenant_members` row (or super_admin). Kitchen role sees Orders + Kitchen only.

---

## 4) Landing + landing admin

| Label | Path |
|--------|------|
| **Platform product landing** | `/site` |
| **This link map (UI)** | `/site/links` |
| Restaurant home (brand or CMS) | `/fa` |
| Public CMS page by slug | `/fa/p/{slug}` |
| CMS pages admin | `/fa/admin/pages` |
| CMS page editor | `/fa/admin/pages/{id}` |

Enable `cms` on the tenant, publish a page with slug `home` to replace the default restaurant home.

---

## 5) Demo (portfolio / mock — no auth)

| Label | Path |
|--------|------|
| Demo admin dashboard | `/demo/admin` |
| Demo orders | `/demo/admin/orders` |
| Demo menu | `/demo/admin/menu` |
| Demo QR | `/demo/admin/qr` |
| Demo settings | `/demo/admin/settings` |
| Design system | `/demo/design-system` |
| QR table demo | `/fa/qr-demo` |

---

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_DEFAULT_TENANT=chashni
NEXT_PUBLIC_BASE_URL=http://localhost:3000
ZARINPAL_MERCHANT_ID=          # optional global fallback
ZARINPAL_SANDBOX=true          # optional
```

Per-tenant Zarinpal merchant: Admin → Settings → `payment.zarinpal_merchant_id` (when module `payment` is on).

## Migrations

Run in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_repair_schema.sql`
3. `supabase/migrations/003_fix_encoding.sql`
4. `supabase/migrations/004_platform_complete.sql`

## Module on/off checklist

- [ ] `payment` off → checkout only cashier; on → Zarinpal + cashier
- [ ] `cms` off → default home; on + published `home` → CMS blocks
- [ ] `delivery` off → no delivery type; on → address required
- [ ] `builder` off → `/build-burger` redirects to menu
- [ ] `reservations` off → admin nav hidden; `/reserve` API 403
- [ ] `loyalty` off → no points; on → points after order for logged-in users
- [ ] `favorites` → localStorage for guests; DB sync when logged in
- [ ] `auth` on → login required to place orders
