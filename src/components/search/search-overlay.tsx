"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, Trash2 } from "lucide-react";
import { useLocaleContext } from "@/lib/providers/locale-provider";
import { useSearch } from "@/lib/hooks";
import { useMenuContext } from "@/lib/providers/data-provider";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/menu/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { MenuItem } from "@/lib/types";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (item: MenuItem) => void;
  onOpenDetail?: (item: MenuItem) => void;
  className?: string;
}

export function SearchOverlay({ isOpen, onClose, onAddToCart, onOpenDetail, className }: SearchOverlayProps) {
  const { locale } = useLocaleContext();
  const { menuItems } = useMenuContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, results, recentSearches, addRecentSearch, clearRecentSearches } =
    useSearch(menuItems);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      addRecentSearch(query.trim());
    }
  }, [query, addRecentSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearch();
      if (e.key === "Escape") onClose();
    },
    [handleSearch, onClose]
  );

  const handleSelectRecent = useCallback(
    (term: string) => {
      setQuery(term);
      addRecentSearch(term);
    },
    [setQuery, addRecentSearch]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn("fixed inset-0 z-[80] bg-[#0a0a0a]", className)}
        >
          <div className="mx-auto max-w-3xl px-4">
            <div className="flex items-center gap-3 py-4">
              <div className="flex flex-1 items-center gap-3 rounded-2xl bg-[#141414] border border-[#222] px-4 py-3">
                <Search size={18} className="text-[#666] shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={locale === "fa" ? "جستجو در منو..." : "Search menu..."}
                  className="flex-1 bg-transparent text-sm text-[#faf5e4] placeholder-[#555] focus:outline-none"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-[#666] hover:text-[#aaa]">
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-sm text-[#888] hover:text-[#ccc] transition-colors shrink-0"
              >
                {locale === "fa" ? "لغو" : "Cancel"}
              </button>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 80px)" }}>
              {!query.trim() && recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-[#666] uppercase tracking-wider">
                      {locale === "fa" ? "جستجوهای اخیر" : "Recent Searches"}
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-[#555] hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      {locale === "fa" ? "پاک کردن" : "Clear"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSelectRecent(term)}
                        className="flex items-center gap-1.5 rounded-full bg-[#1e1e1e] border border-[#333] px-3 py-1.5 text-xs text-[#aaa] hover:border-amber-500/30 hover:text-amber-400 transition-colors"
                      >
                        <Clock size={12} />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query.trim() && results.length === 0 && (
                <EmptyState
                  icon={<Search size={24} />}
                  title={locale === "fa" ? "نتیجه‌ای یافت نشد" : "No results found"}
                  description={
                    locale === "fa"
                      ? "چیزی با این عبارت پیدا نشد"
                      : "Nothing matches your search"
                  }
                />
              )}

              {results.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-8">
                  {results.map((item) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      onAddToCart={onAddToCart}
                      onOpenDetail={(i) => {
                        onClose();
                        onOpenDetail?.(i);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
