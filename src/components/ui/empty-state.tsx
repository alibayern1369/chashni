import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1e1e1e] border border-[#252525] text-[#555] mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-[#ccc] mb-1">{title}</h3>
      <p className="text-xs text-[#666]">{description}</p>
    </div>
  );
}
