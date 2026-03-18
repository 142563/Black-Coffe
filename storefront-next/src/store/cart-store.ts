"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartAddInput, CartItem } from "@/lib/types";

interface CartState {
  items: CartItem[];
  addItem: (input: CartAddInput) => void;
  setQuantity: (input: CartAddInput, quantity: number) => void;
  increase: (productId: string) => void;
  decrease: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export const CART_STORAGE_KEY = "black_coffe_cart";
export const IVA_RATE = 0.12;
export const SHIPPING_COST = 0;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (input) => {
        const quantityToAdd = input.quantity && input.quantity > 0 ? input.quantity : 1;
        const existing = get().items.find((item) => item.productId === input.productId);
        if (existing) {
          get().setQuantity(input, existing.quantity + quantityToAdd);
          return;
        }

        set({
          items: [
            ...get().items,
            {
              productId: input.productId,
              name: input.name,
              unitPrice: input.unitPrice,
              quantity: quantityToAdd,
            },
          ],
        });
      },
      setQuantity: (input, quantity) => {
        if (quantity <= 0) {
          get().remove(input.productId);
          return;
        }

        const existing = get().items.find((item) => item.productId === input.productId);
        if (existing) {
          set({
            items: get().items.map((item) =>
              item.productId === input.productId ? { ...item, quantity } : item
            ),
          });
          return;
        }

        set({
          items: [
            ...get().items,
            {
              productId: input.productId,
              name: input.name,
              unitPrice: input.unitPrice,
              quantity,
            },
          ],
        });
      },
      increase: (productId) => {
        const current = get().items.find((item) => item.productId === productId);
        if (!current) return;
        get().setQuantity(current, current.quantity + 1);
      },
      decrease: (productId) => {
        const current = get().items.find((item) => item.productId === productId);
        if (!current) return;
        get().setQuantity(current, current.quantity - 1);
      },
      remove: (productId) => set({ items: get().items.filter((item) => item.productId !== productId) }),
      clear: () => set({ items: [] }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function getCartSubtotal(items: CartItem[]) {
  return Math.round(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) * 100) / 100;
}

export function getCartIvaAmount(items: CartItem[]) {
  return Math.round(getCartSubtotal(items) * IVA_RATE * 100) / 100;
}

export function getCartGrandTotal(items: CartItem[]) {
  return Math.round((getCartSubtotal(items) + SHIPPING_COST + getCartIvaAmount(items)) * 100) / 100;
}

export function getCartItemsCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
