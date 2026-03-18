"use client";

import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency } from "@/lib/format";
import { getCartGrandTotal, getCartIvaAmount, getCartSubtotal, SHIPPING_COST, useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { useHydrated } from "@/hooks/use-hydrated";

export function CartPage() {
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const increase = useCartStore((state) => state.increase);
  const decrease = useCartStore((state) => state.decrease);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);
  const pushToast = useUiStore((state) => state.pushToast);

  if (!hydrated) {
    return (
      <div className="page-container">
        <section className="section-panel animate-pulse p-8">
          <div className="h-3 w-20 rounded-full bg-white/10" />
          <div className="mt-5 h-8 w-72 rounded-full bg-white/10" />
          <div className="mt-8 h-52 rounded-[1.5rem] bg-white/8" />
        </section>
      </div>
    );
  }

  const subtotal = getCartSubtotal(items);
  const iva = getCartIvaAmount(items);
  const total = getCartGrandTotal(items);

  if (!items.length) {
    return (
      <div className="page-container">
        <EmptyState
          icon="cart"
          title="Tu carrito esta vacio"
          description="Agrega productos desde el menu para continuar con tu pedido y luego cerrar el checkout desde una sola interfaz."
          action={
            <Link href="/catalog" className="button-primary">
              Ver menu
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <section className="space-y-6">
        <PageHeader
          eyebrow="Carrito"
          title="Revisa tu pedido"
          description="Ajusta cantidades, elimina items o sigue comprando antes de pasar a checkout."
          actions={
            <Link href="/catalog" className="button-secondary">
              Seguir comprando
            </Link>
          }
        />

        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.productId} className="section-panel flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">{item.name}</h2>
                <p className="mt-2 text-sm leading-7 text-white/58">{formatCurrency(item.unitPrice)} por unidad</p>
              </div>

              <div className="flex flex-col gap-4 sm:items-end">
                <strong className="text-xl text-[#ead7b3]">{formatCurrency(item.unitPrice * item.quantity)}</strong>
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] p-1">
                    <button
                      type="button"
                      className="grid size-9 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
                      onClick={() => decrease(item.productId)}
                    >
                      -
                    </button>
                    <span className="min-w-10 text-center text-sm font-semibold text-white">{item.quantity}</span>
                    <button
                      type="button"
                      className="grid size-9 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
                      onClick={() => increase(item.productId)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => {
                      remove(item.productId);
                      pushToast({ tone: "info", title: "Producto eliminado" });
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="section-panel h-fit p-6 xl:sticky xl:top-32">
        <p className="section-eyebrow">Resumen</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Totales</h2>
        <div className="mt-8 space-y-3 text-sm text-white/65">
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
          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-base">
            <span className="font-semibold text-white">Total</span>
            <strong className="text-[#ead7b3]">{formatCurrency(total)}</strong>
          </div>
        </div>

        <div className="mt-8 grid gap-3">
          <Link href="/checkout" className="button-primary w-full">
            Ir a checkout
          </Link>
          <button
            type="button"
            className="button-secondary w-full"
            onClick={() => {
              clear();
              pushToast({ tone: "info", title: "Carrito vaciado" });
            }}
          >
            Vaciar carrito
          </button>
        </div>
      </aside>
    </div>
  );
}
