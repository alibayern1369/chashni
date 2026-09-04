"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { useMenuContext } from "@/lib/providers/data-provider";
import { useCartContext } from "@/lib/providers/cart-provider";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { useFilters } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { CategoryTabs } from "@/components/menu/category-tabs";
import { MenuSection } from "@/components/menu/menu-section";
import { FloatingCartBar } from "@/components/cart/floating-cart-bar";
import { SearchOverlay } from "@/components/search/search-overlay";
import { FilterSheet } from "@/components/search/filter-sheet";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { ProductCard } from "@/components/menu/product-card";
import type { Locale, MenuItem } from "@/lib/types";
import { X, Check, Clock, Flame, Leaf, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { Price } from "@/components/ui/price";
import { Button } from "@/components/ui/button";
import { QuantityControl } from "@/components/ui/quantity-control";
import { useFavorites } from "@/lib/hooks";
import { formatPrice } from "@/lib/utils";

export default function MenuPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const table = searchParams.get("table") || undefined;

  const { categories, menuItems } = useMenuContext();
  const { locale: ctxLocale } = useLocaleContext();
  const { addItem } = useCartContext();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { filters, onFilterChange, onClear, hasActiveFilters, filteredItems } = useFilters(menuItems);

  const [activeCategory, setActiveCategory] = useState(categories[0]?.slug || "");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const scrollToCategory = useCallback((slug: string) => {
    setActiveCategory(slug);
    const el = sectionRefs.current[slug];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const slug = entry.target.id.replace("category-", "");
            setActiveCategory(slug);
          }
        }
      },
      { rootMargin: "-100px 0px -60% 0px" }
    );

    categories.forEach((cat) => {
      const el = sectionRefs.current[cat.slug];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleAddToCart = useCallback((item: MenuItem) => {
    addItem({
      menuItemId: item.id,
      quantity: 1,
      selectedOptions: {},
      selectedExtras: [],
    });
  }, [addItem]);

  const handleProductDetailAdd = useCallback(() => {
    if (!selectedProduct) return;
    addItem({
      menuItemId: selectedProduct.id,
      quantity,
      selectedOptions,
      selectedExtras,
    });
    setSelectedProduct(null);
    setSelectedOptions({});
    setSelectedExtras([]);
    setQuantity(1);
  }, [selectedProduct, quantity, selectedOptions, selectedExtras, addItem]);

  const categoryGroups = categories.map((cat) => ({
    ...cat,
    items: filteredItems.filter((item) => item.categorySlug === cat.slug),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen">
      <CategoryTabs activeCategory={activeCategory} onCategorySelect={scrollToCategory} />

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Filter toggle */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setFilterOpen(true)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all border",
              hasActiveFilters
                ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                : "bg-[#141414] border-[#222] text-[#888] hover:border-[#333]"
            )}
          >
            <SlidersHorizontal size={16} />
            {isRtl ? "فیلترها" : "Filters"}
            {hasActiveFilters && (
              <span className="h-5 w-5 rounded-full bg-amber-500 text-black text-xs font-bold flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>

        {/* Category sections */}
        <div className="space-y-12">
          {categoryGroups.map((group) => (
            <div
              key={group.id}
              ref={(el) => { sectionRefs.current[group.slug] = el; }}
              id={`category-${group.slug}`}
              className="scroll-mt-32"
            >
              <MenuSection
                categoryId={group.id}
                categoryNameFa={group.nameFa}
                categoryNameEn={group.nameEn}
                categoryIcon={group.icon}
                items={group.items}
                onAddToCart={handleAddToCart}
                onOpenDetail={setSelectedProduct}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Floating cart bar */}
      <FloatingCartBar onClick={() => setCartOpen(true)} />

      {/* Cart drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
        }}
      />

      {/* Search overlay */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onAddToCart={handleAddToCart}
        onOpenDetail={setSelectedProduct}
      />

      {/* Filter sheet */}
      <FilterSheet
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onFilterChange={onFilterChange}
        onClear={onClear}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Product detail sheet */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-[70] max-h-[90vh] overflow-y-auto rounded-t-3xl bg-[#0a0a0a] border-t border-[#222]"
            >
              <div className="mx-auto max-w-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#faf5e4]">
                    {isRtl ? selectedProduct.nameFa : selectedProduct.nameEn}
                  </h2>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e1e1e] text-[#888] hover:text-[#ccc]"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="rounded-2xl overflow-hidden bg-[#141414] border border-[#1e1e1e] mb-4">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={selectedProduct.image}
                      alt={isRtl ? selectedProduct.nameFa : selectedProduct.nameEn}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {selectedProduct.isBestseller && <Badge variant="bestseller" />}
                      {selectedProduct.isNew && <Badge variant="new" />}
                      {selectedProduct.isChefPick && <Badge variant="chefPick" />}
                      {selectedProduct.isVegetarian && <Badge variant="vegetarian" />}
                    </div>
                    <Rating rating={selectedProduct.rating} reviewCount={selectedProduct.reviewCount} size="md" />
                    <p className="text-sm text-[#888] mt-3 leading-relaxed">
                      {isRtl ? selectedProduct.descFa : selectedProduct.descEn}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-[#666]">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {selectedProduct.preparationTime} {isRtl ? "دقیقه" : "min"}
                      </span>
                      <span>{selectedProduct.calories} cal</span>
                      {selectedProduct.spicyLevel > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Flame size={12} className="text-red-400" />
                          {selectedProduct.spicyLevel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Options */}
                {selectedProduct.options.map((group) => (
                  <div key={group.id} className="mb-4">
                    <h3 className="text-sm font-semibold text-[#ccc] mb-2">
                      {isRtl ? group.nameFa : group.nameEn}
                      {group.required && <span className="text-red-400 ml-1">*</span>}
                    </h3>
                    <div className="space-y-2">
                      {group.options.map((opt) => {
                        const isSelected = (selectedOptions[group.id] || []).includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              if (group.type === "radio") {
                                setSelectedOptions((prev) => ({ ...prev, [group.id]: [opt.id] }));
                              } else {
                                setSelectedOptions((prev) => {
                                  const current = prev[group.id] || [];
                                  return {
                                    ...prev,
                                    [group.id]: isSelected
                                      ? current.filter((id) => id !== opt.id)
                                      : [...current, opt.id],
                                  };
                                });
                              }
                            }}
                            className={cn(
                              "flex w-full items-center justify-between rounded-xl p-3 text-sm transition-all border",
                              isSelected
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                : "bg-[#141414] border-[#1e1e1e] text-[#ccc] hover:border-[#333]"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                                  isSelected ? "border-amber-400 bg-amber-400" : "border-[#444]"
                                )}
                              >
                                {isSelected && <Check size={12} className="text-black" />}
                              </div>
                              <span>{isRtl ? opt.nameFa : opt.nameEn}</span>
                            </div>
                            {opt.priceModifier !== 0 && (
                              <span className="text-xs text-[#666]">
                                {opt.priceModifier > 0 ? "+" : ""}{formatPrice(opt.priceModifier, locale)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Extras */}
                {selectedProduct.extras.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[#ccc] mb-2">
                      {isRtl ? "اضافات" : "Extras"}
                    </h3>
                    <div className="space-y-2">
                      {selectedProduct.extras.map((extra) => {
                        const isSelected = selectedExtras.includes(extra.id);
                        return (
                          <button
                            key={extra.id}
                            onClick={() => {
                              setSelectedExtras((prev) =>
                                isSelected ? prev.filter((id) => id !== extra.id) : [...prev, extra.id]
                              );
                            }}
                            className={cn(
                              "flex w-full items-center justify-between rounded-xl p-3 text-sm transition-all border",
                              isSelected
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                : "bg-[#141414] border-[#1e1e1e] text-[#ccc] hover:border-[#333]"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-5 w-5 items-center justify-center rounded-lg border-2 transition-all",
                                  isSelected ? "border-amber-400 bg-amber-400" : "border-[#444]"
                                )}
                              >
                                {isSelected && <Check size={12} className="text-black" />}
                              </div>
                              <span>{isRtl ? extra.nameFa : extra.nameEn}</span>
                            </div>
                            <span className="text-xs text-[#666]">
                              {formatPrice(extra.price, locale)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity & Add to cart */}
                <div className="sticky bottom-0 bg-[#0a0a0a] pt-4 border-t border-[#1e1e1e]">
                  <div className="flex items-center justify-between mb-3">
                    <QuantityControl value={quantity} onChange={setQuantity} size="md" />
                    <Price amount={selectedProduct.basePrice * quantity} locale={locale} size="lg" />
                  </div>
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={handleProductDetailAdd}
                  >
                    {isRtl ? "افزودن به سبد" : "Add to Cart"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
