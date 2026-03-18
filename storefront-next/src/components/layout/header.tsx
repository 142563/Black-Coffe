"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/icon";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getCartGrandTotal, getCartItemsCount, useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { useUiStore } from "@/store/ui-store";
import { useHydrated } from "@/hooks/use-hydrated";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/catalog", label: "Menu" },
  { href: "/cart", label: "Carrito" },
  { href: "/reservations", label: "Reservas" },
];

export function Header() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const auth = useAuthStore((state) => state.auth);
  const logout = useAuthStore((state) => state.logout);
  const items = useCartStore((state) => state.items);
  const openCartDrawer = useUiStore((state) => state.setCartDrawerOpen);
  const [menuOpen, setMenuOpen] = useState(false);

  const totalItems = hydrated ? getCartItemsCount(items) : 0;
  const cartTotal = hydrated ? getCartGrandTotal(items) : 0;
  const isHome = pathname === "/";

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-white/10 transition duration-300 no-print",
        isHome ? "bg-black/70 backdrop-blur-xl" : "bg-[#090705]/92 backdrop-blur-xl"
      )}
    >
      <div className="page-container flex items-center gap-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/12 bg-black/50 p-2">
            <Image
              src="/brand/logo-black-coffe.jpeg"
              alt="Black Coffe"
              width={36}
              height={36}
              className="rounded-xl"
            />
          </div>
          <div className="hidden min-w-0 md:block">
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#c6a15b]">
              Black Coffe
            </p>
            <p className="mt-1 truncate text-sm text-white/80">
              Mas que una bebida... es un estilo de vida.
            </p>
          </div>
        </Link>

        <nav className="mx-auto hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2 py-2 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-5 py-3 text-sm font-semibold transition",
                  active
                    ? "bg-[#c6a15b] text-black shadow-[0_12px_32px_rgba(198,161,91,0.32)]"
                    : "text-white/75 hover:bg-white/8 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-white/25 hover:text-white md:hidden"
            onClick={() => openCartDrawer(true)}
          >
            <Icon name="cart" className="size-4" />
            <span>{totalItems}</span>
          </button>
          <button
            type="button"
            className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-white/25 hover:text-white md:inline-flex"
            onClick={() => openCartDrawer(true)}
          >
            <span>{formatCurrency(cartTotal)}</span>
            <span className="grid min-w-8 place-items-center rounded-full bg-[#c6a15b] px-2 py-1 text-xs font-bold text-black">
              {totalItems}
            </span>
          </button>

          {hydrated && auth ? (
            <>
              <Link
                href="/profile"
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:border-white/35 hover:bg-white/5"
              >
                Mi cuenta
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-[#c6a15b] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#d8b36a]"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:border-white/35 hover:bg-white/5"
            >
              Login
            </Link>
          )}

          <button
            type="button"
            className="inline-flex size-12 items-center justify-center rounded-full border border-white/10 text-white/80 transition hover:border-white/30 hover:text-white lg:hidden"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label="Abrir menu"
          >
            <span className="relative block h-4 w-5">
              <span
                className={cn(
                  "absolute left-0 top-0 h-0.5 w-5 bg-current transition",
                  menuOpen && "top-1.5 rotate-45"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1.5 h-0.5 w-5 bg-current transition",
                  menuOpen && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-3 h-0.5 w-5 bg-current transition",
                  menuOpen && "top-1.5 -rotate-45"
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-white/10 transition-[max-height,opacity] duration-300 lg:hidden",
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="page-container grid gap-3 py-4">
          <nav className="grid gap-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                    active
                      ? "border-[#c6a15b]/55 bg-[#c6a15b] text-black"
                      : "border-white/10 bg-white/[0.03] text-white/75 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {!auth ? (
            <Link href="/login" className="button-secondary w-full">
              Login
            </Link>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href="/profile" className="button-secondary w-full">
                Mi cuenta
              </Link>
              <button
                type="button"
                onClick={logout}
                className="button-primary w-full"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
