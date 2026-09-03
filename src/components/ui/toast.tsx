"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

const icons: Record<ToastItem["type"], typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const bgStyles: Record<ToastItem["type"], string> = {
  success: "bg-emerald-600",
  error: "bg-red-600",
  info: "bg-blue-600",
};

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2 w-full max-w-sm px-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white shadow-2xl",
                bgStyles[toast.type]
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1 font-medium">{toast.message}</span>
              <button
                onClick={() => onRemove(toast.id)}
                className="shrink-0 rounded-full p-1 hover:bg-white/20 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
