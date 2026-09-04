# CHASHNI — نقشه لینک‌ها (جدا و واضح)

چهار سطح جدا:

| سطح | پیشوند |
|------|--------|
| لندینگ پلتفرم | `/site` |
| سوپر ادمین | `/super` |
| رستوران | `/r/{slug}` مثلاً `/r/chashni` |
| دمو | `/demo` |

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

## ۲) رستوران چاشنی — مشتری

| نقش | آدرس |
|-----|------|
| هوم | `/r/chashni` |
| منو | `/r/chashni/menu` |
| منو + میز | `/r/chashni/menu?table=07` |
| سبد / چک‌اوت | `/r/chashni/cart` · `/r/chashni/checkout` |
| ورود | `/r/chashni/login` |

آدرس‌های قدیمی `/fa/...` به `/r/chashni/...` ریدایرکت می‌شوند.

---

## ۳) رستوران چاشنی — ادمین

| نقش | آدرس |
|-----|------|
| سفارش‌ها | `/r/chashni/admin` |
| منو | `/r/chashni/admin/menu` |
| آشپزخانه | `/r/chashni/admin/kitchen` |
| میز و QR | `/r/chashni/admin/tables` |
| لندینگ CMS رستوران | `/r/chashni/admin/pages` |
| تنظیمات | `/r/chashni/admin/settings` |

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
NEXT_PUBLIC_DEFAULT_TENANT=chashni
NEXT_PUBLIC_BASE_URL=https://chashni-seven.vercel.app
```

## Migrations

1. `001_initial_schema.sql`
2. `002_repair_schema.sql`
3. `003_fix_encoding.sql`
4. `004_platform_complete.sql`
5. `005_username_login.sql`
