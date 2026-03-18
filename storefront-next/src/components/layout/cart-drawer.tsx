"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { formatCurrency } from "@/lib/format";
import { getCartGrandTotal, getCartItemsCount, getCartIvaAmount, getCartSubtotal, SHIPPING_COST, useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";

export function CartDrawer() {
  const open = useUiStore((state) => state.cartDrawerOpen);
  const setOpen = useUiStore((state) => state.setCartDrawerOpen);
  const items = useCartStore((state) => state.items);
  const increase = useCartStore((state) => state.increase);
  const decrease = useCartStore((state) => state.decrease);
  const remove = useCartStore((state) => state.remove);

  const subtotal = getCartSubtotal(items);
  const iva = getCartIvaAmount(items);
  const total = getCartGrandTotal(items);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            aria-label="Cerrar carrito"
            className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-[75] flex h-dvh w-full max-w-md flex-col border-l border-white/10 bg-[#090705] px-5 pb-6 pt-24 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-[#c6a15b]">Carrito</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Tu seleccion</h2>
                <p className="mt-2 text-sm text-white/60">
                  {getCartItemsCount(items)} {getCartItemsCount(items) === 1 ? "item" : "items"} listos para checkout.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.22em] text-white/70 transition hover:border-white/30 hover:text-white"
                onClick={() => setOpen(false)}
              >
                cerrar
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {items.length === 0 ? (
                <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 text-center">
                  <h3 className="text-xl font-semibold text-white">Tu carrito esta vacio</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Agrega productos desde el menu para continuar con tu pedido.
                  </p>
                  <Link
                    href="/catalog"
                    onClick={() => setOpen(false)}
                    className="mt-5 inline-flex rounded-full bg-[#c6a15b] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black"
                  >
                    Ver menu
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <article
                    key={item.productId}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-white">{item.name}</h3>
                        <p className="mt-1 text-sm text-white/55">
                          {formatCurrency(item.unitPrice)} por unidad
                        </p>
                      </div>
                      <strong className="text-sm text-[#ead7b3]">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </strong>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div className="inline-flex items-center rounded-full border border-white/10 bg-black/30 p-1">
                        <button
                          type="button"
                          className="grid size-9 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
                          onClick={() => decrease(item.productId)}
                        >
                          -
                        </button>
                        <span className="min-w-10 text-center text-sm font-semibold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="grid size-9 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
                          onClick={() => increase(item.productId)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-xs uppercase tracking-[0.22em] text-white/45 transition hover:text-red-300"
                        onClick={() => remove(item.productId)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
              <div className="space-y-2 text-sm text-white/65">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <strong className="text-white">{formatCurrency(subtotal)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Envio</span>
                  <strong className="text-white">{formatCurrency(SHIPPING_COST)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>IVA 12%</span>
                  <strong className="text-white">{formatCurrency(iva)}</strong>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-base">
                  <span className="font-medium text-white">Total</span>
                  <strong className="text-[#ead7b3]">{formatCurrency(total)}</strong>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:border-white/30 hover:bg-white/5"
                >
                  Ver carrito
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-[#c6a15b] px-5 py-3 text-center text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#d5b270]"
                >
                  Ir a pagar
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
