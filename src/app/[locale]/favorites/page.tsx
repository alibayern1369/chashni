"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useMenuContext } from "@/lib/providers/data-provider";
import { useFavorites } from "@/lib/hooks";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { ProductCard } from "@/components/menu/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Locale } from "@/lib/types";

export default function FavoritesPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const { favorites } = useFavorites();
  const { menuItems } = useMenuContext();

  const favoriteItems = menuItems.filter((item) => favorites.includes(item.id));

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-[#faf5e4] mb-6">
          {isRtl ? "علاقه‌مندی‌ها" : "Favorites"}
        </h1>

        {favoriteItems.length === 0 ? (
          <EmptyState
            icon={<Heart size={28} />}
            title={isRtl ? "هنوز علاقه‌مندی ندارید" : "No favorites yet"}
            description={isRtl ? "غذاهای مورد علاقه‌تان را اینجا ذخیره کنید" : "Save your favorite dishes here"}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onOpenDetail={() => router.push(`/${locale}/menu`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
