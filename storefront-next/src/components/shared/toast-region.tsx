"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useUiStore } from "@/store/ui-store";

export function ToastRegion() {
  const toasts = useUiStore((state) => state.toasts);
  const dismissToast = useUiStore((state) => state.dismissToast);

  return (
    <div className="pointer-events-none fixed right-4 top-24 z-[80] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="pointer-events-auto rounded-2xl border border-white/10 bg-black/85 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p
                  className={
                    toast.tone === "error"
                      ? "text-sm font-semibold text-red-300"
                      : toast.tone === "success"
                        ? "text-sm font-semibold text-[#d8b06a]"
                        : "text-sm font-semibold text-white"
                  }
                >
                  {toast.title}
                </p>
                {toast.description ? (
                  <p className="text-sm leading-6 text-white/70">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                className="text-xs font-medium uppercase tracking-[0.24em] text-white/45 transition hover:text-white"
                onClick={() => dismissToast(toast.id)}
              >
                cerrar
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
