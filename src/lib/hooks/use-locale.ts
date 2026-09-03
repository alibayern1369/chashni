"use client";

import { useLocaleContext } from "@/lib/providers/locale-provider";
export function useLocale() {
  return useLocaleContext();
}
