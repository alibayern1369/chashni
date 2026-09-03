"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useTable() {
  const searchParams = useSearchParams();
  const table = useMemo(() => searchParams.get("table") ?? undefined, [searchParams]);
  return { table };
}
