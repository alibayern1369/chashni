import Link from "next/link";
import { restaurantPath, sitePath } from "@/lib/routes";

/**
 * Platform landing admin — separate from restaurant CMS admin.
 * Restaurant page CMS lives at /r/{slug}/admin/pages
 */
export default function SiteAdminPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-[#faf5e4]" dir="rtl">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-black">ادمین لندینگ پلتفرم</h1>
        <p className="text-sm text-[#888]">
          این بخش مال لندینگ محصول (`/site`) است — جدا از پنل رستوران و سوپر ادمین.
        </p>
        <ul className="space-y-3 rounded-2xl border border-[#1e1e1e] bg-[#141414] p-5 text-sm">
          <li>
            <Link href={sitePath()} className="text-amber-400 hover:underline">
              مشاهده لندینگ /site
            </Link>
          </li>
          <li>
            <Link href={sitePath("/links")} className="text-amber-400 hover:underline">
              ویرایش/مشاهده نقشه لینک‌ها
            </Link>
          </li>
          <li className="border-t border-[#1e1e1e] pt-3 text-[#666]">
            لندینگ CMS خود رستوران چاشنی:{" "}
            <Link
              href={restaurantPath("/admin/pages")}
              className="text-amber-400 hover:underline"
              dir="ltr"
            >
              /r/chashni/admin/pages
            </Link>
          </li>
        </ul>
        <Link href={sitePath()} className="inline-block text-sm text-[#888] hover:text-amber-400">
          ← بازگشت
        </Link>
      </div>
    </div>
  );
}
