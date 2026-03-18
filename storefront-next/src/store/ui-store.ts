"use client";

import { create } from "zustand";

type ToastTone = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface UiState {
  cartDrawerOpen: boolean;
  toasts: ToastMessage[];
  setCartDrawerOpen: (open: boolean) => void;
  pushToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  cartDrawerOpen: false,
  toasts: [],
  setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),
  pushToast: (toast) => {
    const id = crypto.randomUUID();
    set({ toasts: [...get().toasts, { id, ...toast }] });
    window.setTimeout(() => {
      get().dismissToast(id);
    }, 2600);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),
}));
