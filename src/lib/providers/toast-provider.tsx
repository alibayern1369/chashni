"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertCircle, Info } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextValue {
  showToast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const icons: Record<Toast["type"], typeof Check> = {
  success: Check,
  error: AlertCircle,
  info: Info,
};

const colors: Record<Toast["type"], string> = {
  success: "bg-emerald-500/15 border-emerald-500/20 text-emerald-400",
  error: "bg-red-500/15 border-red-500/20 text-red-400",
  info: "bg-blue-500/15 border-blue-500/20 text-blue-400",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-4 left-4 md:right-auto md:left-auto md:top-20 md:w-80 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = icons[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium backdrop-blur-xl ${colors[toast.type]}`}
              >
                <Icon size={16} />
                <span className="flex-1">{toast.message}</span>
                <button onClick={() => removeToast(toast.id)} className="text-current opacity-60 hover:opacity-100">
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
