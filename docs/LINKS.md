# CHASHNI Platform / رستوران نمکدان — نقشه لینک‌ها

چهار سطح جدا:

| سطح | پیشوند | معنی |
|------|--------|------|
| لندینگ پلتفرم | `/site` | CHASHNI (محصول) |
| سوپر ادمین | `/super` | مدیریت چند رستوران روی پلتفرم |
| رستوران نمکدان | `/r/namakdan` | یکی از tenantها (نه خود پلتفرم) |
| دمو | `/demo` | نمونه پورتفولیو |

> **چاشنی** = پلتفرم چندرستورانه · **نمکدان** = رستوران نمونه با slug=`namakdan`

---

## ۱) سوپر ادمین پلتفرم

| نقش | آدرس |
|-----|------|
| ورود | `/super/login` |
| داشبورد | `/super` |
| رستوران‌ها + ماژول‌ها | `/super/tenants` |
| کاربران / ساخت یوزر / تغییر رمز | `/super/users` |

اگر سوپرادمین نباشد، در `/super/login` دکمهٔ ساخت `admin` / `admin` می‌آید.

---

## ۲) رستوران نمکدان — مشتری

| نقش | آدرس |
|-----|------|
| هوم / لندینگ | `/r/namakdan` |
| منو | `/r/namakdan/menu` |
| منو + میز | `/r/namakdan/menu?table=07` |
| ساخت برگر (فقط از لندینگ) | `/r/namakdan/build-burger` |
| سبد / چک‌اوت | `/r/namakdan/cart` · `/r/namakdan/checkout` |
| ورود | `/r/namakdan/login` |

آدرس‌های قدیمی `/fa/...` و `/r/chashni/...` به `/r/namakdan/...` ریدایرکت می‌شوند.

---

## ۳) رستوران نمکدان — ادمین

| نقش | آدرس |
|-----|------|
| سفارش‌ها | `/r/namakdan/admin/orders` |
| خانه / داشبورد | `/r/namakdan/admin` |
| آشپزخانه | `/r/namakdan/admin/kitchen` |
| منو | `/r/namakdan/admin/menu` |
| میز و QR | `/r/namakdan/admin/tables` |
| لندینگ CMS رستوران | `/r/namakdan/admin/pages` |
| تخفیف‌ها | `/r/namakdan/admin/promotions` |
| تصاویر | `/r/namakdan/admin/media` |
| رزرو | `/r/namakdan/admin/reservations` |
| گزارش‌ها | `/r/namakdan/admin/reports` |
| کاربران پنل | `/r/namakdan/admin/staff` |
| تنظیمات | `/r/namakdan/admin/settings` |

---

## ۴) لندینگ پلتفرم + ادمین لندینگ

| نقش | آدرس |
|-----|------|
| لندینگ محصول | `/site` (و `/` → `/site`) |
| نقشه لینک‌ها | `/site/links` |
| ادمین لندینگ پلتفرم | `/site/admin` |

---

## ۵) دمو

| نقش | آدرس |
|-----|------|
| داشبورد دمو | `/demo/admin` |
| دیزاین سیستم | `/demo/design-system` |

---

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_DEFAULT_TENANT=namakdan
NEXT_PUBLIC_BASE_URL=https://chashni-seven.vercel.app
```

## Migrations

1. `001_initial_schema.sql`
2. `002_repair_schema.sql`
3. `003_fix_encoding.sql`
4. `004_platform_complete.sql`
5. `005_username_login.sql`
6. `006_orders_insert_policy.sql`
7. `007_admin_panel_hardening.sql`
8. `008_rename_tenant_slug_namakdan.sql`
9. `009_menu_stock_kitchen_perms.sql`
