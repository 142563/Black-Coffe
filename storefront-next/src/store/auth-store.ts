"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthResponse } from "@/lib/types";

interface AuthState {
  auth: AuthResponse | null;
  setAuth: (auth: AuthResponse | null) => void;
  logout: () => void;
}

export const AUTH_STORAGE_KEY = "black_coffe_auth";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      auth: null,
      setAuth: (auth) => set({ auth }),
      logout: () => set({ auth: null }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function getAccessToken(state: AuthState) {
  return state.auth?.accessToken ?? null;
}
