"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getErrorStatus, getErrorMessage } from "@/lib/error";
import { formatCurrency, formatDate } from "@/lib/format";
import type { CreateOrderResponse, Invoice, PlaceOrderRequest } from "@/lib/types";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { useHydrated } from "@/hooks/use-hydrated";

export function CheckoutPage() {
  const hydrated = useHydrated();
  const auth = useAuthStore((state) => state.auth);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const pushToast = useUiStore((state) => state.pushToast);

  const [serviceType, setServiceType] = useState<"pickup" | "dinein">("pickup");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNit, setCustomerNit] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof apiClient.previewOrder>> | null>(null);
  const [orderResult, setOrderResult] = useState<CreateOrderResponse | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const previewPayload = useMemo(
    () => ({
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    }),
    [items]
  );

  useEffect(() => {
    if (!auth?.user) return;
    setCustomerName((current) => current || auth.user.fullName);
    setCustomerPhone((current) => current || auth.user.phone);
  }, [auth]);

  useEffect(() => {
    if (!hydrated || !auth?.accessToken || !items.length || orderResult) {
      if (!items.length) {
        setPreview(null);
      }
      return;
    }

    let cancelled = false;
    setLoadingPreview(true);
    apiClient
      .previewOrder(previewPayload)
      .then((response) => {
        if (!cancelled) {
          setPreview(response);
          setMessage("");
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setMessage(getErrorMessage(error, "No se pudo calcular el resumen."));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingPreview(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [auth?.accessToken, hydrated, items.length, orderResult, previewPayload]);

  async function refreshPreview() {
    if (!items.length) {
      setPreview(null);
      return;
    }

    setLoadingPreview(true);
    try {
      const response = await apiClient.previewOrder(previewPayload);
      setPreview(response);
      setMessage("");
    } catch (error) {
      const nextMessage = getErrorMessage(error, "No se pudo calcular el resumen.");
      setMessage(nextMessage);
      pushToast({ tone: "error", title: "Resumen no disponible", description: nextMessage });
    } finally {
      setLoadingPreview(false);
    }
  }

  async function submitOrder() {
    if (!auth?.accessToken || !items.length) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const ensuredPreview = preview ?? (await apiClient.previewOrder(previewPayload));
      setPreview(ensuredPreview);

      const payload = {
        customerName,
        customerPhone,
        customerNit: customerNit || null,
        serviceType,
        notes: notes || null,
        items: previewPayload.items,
      } satisfies PlaceOrderRequest;

      const response = await apiClient.createOrder(payload, auth.accessToken);
      setOrderResult(response);
      clearCart();
      pushToast({ tone: "success", title: "Pedido confirmado", description: `Orden ${response.orderId} creada con exito.` });
    } catch (error) {
      const status = getErrorStatus(error);
      const nextMessage =
        status === 401
          ? "Sesion expirada. Inicia sesion nuevamente."
          : getErrorMessage(error, "No se pudo crear el pedido.");
      setMessage(nextMessage);
      pushToast({ tone: "error", title: "No se pudo confirmar", description: nextMessage });
    } finally {
      setSubmitting(false);
    }
  }

  async function loadInvoice() {
    if (!auth?.accessToken || !orderResult?.orderId) {
      return;
    }

    setLoadingInvoice(true);
    try {
      const nextInvoice = await apiClient.getInvoice(orderResult.orderId, auth.accessToken);
      setInvoice(nextInvoice);
    } catch (error) {
      const nextMessage = getErrorMessage(error, "No se pudo cargar la factura.");
      pushToast({ tone: "error", title: "Factura no disponible", description: nextMessage });
    } finally {
      setLoadingInvoice(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="page-container">
        <section className="section-panel animate-pulse p-8">
          <div className="h-3 w-20 rounded-full bg-white/10" />
          <div className="mt-5 h-8 w-72 rounded-full bg-white/10" />
          <div className="mt-8 h-72 rounded-[1.5rem] bg-white/8" />
        </section>
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="page-container">
        <EmptyState
          icon="user"
          title="Necesitas login para continuar"
          description="Inicia sesion o crea tu cuenta para confirmar pedidos, guardar historial y manejar reservas."
          action={
            <Link href="/login" className="button-primary">
              Ir a login
            </Link>
          }
        />
      </div>
    );
  }

  if (!items.length && !orderResult) {
    return (
      <div className="page-container">
        <EmptyState
          icon="cart"
          title="Tu carrito esta vacio"
          description="Agrega productos al carrito antes de intentar cerrar el checkout."
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
    <div className="page-container space-y-8">
      <PageHeader
        eyebrow="Checkout"
        title="Confirmar pedido"
        description="Resumen comercial con IVA 12% y envio gratis. El backend sigue siendo la fuente real de calculo."
      />

      {!orderResult ? (
        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <form
            className="section-panel space-y-6 p-6"
            onSubmit={(event) => {
              event.preventDefault();
              void submitOrder();
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={`rounded-[1.4rem] border px-4 py-4 ${serviceType === "pickup" ? "border-[#c6a15b]/50 bg-[#c6a15b]/10" : "border-white/10 bg-white/[0.03]"}`}>
                <input
                  type="radio"
                  name="serviceType"
                  value="pickup"
                  checked={serviceType === "pickup"}
                  onChange={() => setServiceType("pickup")}
                  className="sr-only"
                />
                <span className="block text-sm font-semibold uppercase tracking-[0.22em] text-white">Recoger</span>
                <span className="mt-1 block text-sm text-white/55">Listo para retirar en Black Coffe.</span>
              </label>
              <label className={`rounded-[1.4rem] border px-4 py-4 ${serviceType === "dinein" ? "border-[#c6a15b]/50 bg-[#c6a15b]/10" : "border-white/10 bg-white/[0.03]"}`}>
                <input
                  type="radio"
                  name="serviceType"
                  value="dinein"
                  checked={serviceType === "dinein"}
                  onChange={() => setServiceType("dinein")}
                  className="sr-only"
                />
                <span className="block text-sm font-semibold uppercase tracking-[0.22em] text-white">Consumir en local</span>
                <span className="mt-1 block text-sm text-white/55">Preparamos tu pedido para servir en mesa.</span>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input className="input-field" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nombre" required />
              <input className="input-field" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Telefono" required />
            </div>
            <input className="input-field" value={customerNit} onChange={(e) => setCustomerNit(e.target.value)} placeholder="NIT (opcional)" />
            <textarea className="input-field min-h-32 resize-y" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas (opcional)" />

            {message ? <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{message}</p> : null}

            <div className="grid gap-3 sm:grid-cols-3">
              <Link href="/cart" className="button-secondary w-full">
                Volver
              </Link>
              <button type="button" className="button-secondary w-full" onClick={() => void refreshPreview()} disabled={loadingPreview}>
                {loadingPreview ? "Calculando" : "Actualizar"}
              </button>
              <button type="submit" className="button-primary w-full" disabled={submitting || !customerName || !customerPhone}>
                {submitting ? "Confirmando" : "Confirmar pedido"}
              </button>
            </div>
          </form>

          <aside className="section-panel h-fit p-6 xl:sticky xl:top-32">
            <p className="section-eyebrow">Resumen</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Totales del pedido</h2>
            {preview ? (
              <div className="mt-8 space-y-4">
                {preview.items.map((item) => (
                  <div key={item.productId} className="flex items-start justify-between gap-4 rounded-[1.25rem] border border-white/10 bg-black/30 px-4 py-4 text-sm">
                    <div>
                      <strong className="text-white">{item.name}</strong>
                      <p className="mt-1 text-white/50">{item.quantity} x {formatCurrency(item.unitPrice)}</p>
                    </div>
                    <strong className="text-[#ead7b3]">{formatCurrency(item.lineTotal)}</strong>
                  </div>
                ))}
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 text-sm text-white/65">
                  <div className="flex items-center justify-between"><span>Subtotal</span><strong className="text-white">{formatCurrency(preview.summary.subtotal)}</strong></div>
                  <div className="mt-2 flex items-center justify-between"><span>Envio</span><strong className="text-white">{formatCurrency(preview.summary.shipping)}</strong></div>
                  <div className="mt-2 flex items-center justify-between"><span>IVA {Math.round(preview.summary.ivaRate * 100)}%</span><strong className="text-white">{formatCurrency(preview.summary.ivaAmount)}</strong></div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-base"><span className="font-semibold text-white">Total</span><strong className="text-[#ead7b3]">{formatCurrency(preview.summary.total)}</strong></div>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm leading-7 text-white/58">Calcula el resumen para ver subtotal, IVA y total final.</p>
            )}
          </aside>
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="section-panel p-6">
            <p className="section-eyebrow">Pedido confirmado</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Orden {orderResult.orderId}</h2>
            <p className="mt-4 text-sm leading-7 text-white/60">Estado actual: {orderResult.status}. Puedes cargar la factura y luego imprimirla desde esta misma pantalla.</p>
            <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/30 p-5 text-sm text-white/65">
              <div className="flex items-center justify-between"><span>Total confirmado</span><strong className="text-[#ead7b3]">{formatCurrency(orderResult.summary.total)}</strong></div>
              <div className="mt-2 flex items-center justify-between"><span>Creado</span><strong className="text-white">{formatDate(orderResult.createdAt)}</strong></div>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button type="button" className="button-primary w-full" onClick={() => void loadInvoice()} disabled={loadingInvoice}>
                {loadingInvoice ? "Cargando factura" : "Ver factura"}
              </button>
              <Link href="/profile" className="button-secondary w-full">
                Ir a mi cuenta
              </Link>
            </div>
          </div>

          {invoice ? (
            <section className="section-panel printable p-6 text-[#1a140e] print:border-0 print:bg-white print:text-[#1a140e]">
              <p className="section-eyebrow text-[#8b642c]">Factura</p>
              <h2 className="mt-4 text-3xl font-semibold text-white print:text-[#1a140e]">{invoice.business.name}</h2>
              <p className="mt-2 text-sm leading-7 text-white/58 print:text-[#4a4037]">
                {invoice.business.address} | {invoice.business.phone} | {invoice.business.hoursText}
              </p>
              <p className="mt-2 text-sm leading-7 text-white/58 print:text-[#4a4037]">{invoice.businessMessage}</p>

              <div className="mt-6 grid gap-3 rounded-[1.25rem] border border-white/10 bg-black/25 p-4 text-sm text-white/65 print:border-[#ded6ca] print:bg-[#faf6ef] print:text-[#3c342d] sm:grid-cols-2">
                <span><strong>Factura:</strong> {invoice.invoiceNumber}</span>
                <span><strong>Fecha:</strong> {formatDate(invoice.date)}</span>
                {invoice.customerName ? <span><strong>Cliente:</strong> {invoice.customerName}</span> : null}
                {invoice.customerNit ? <span><strong>NIT:</strong> {invoice.customerNit}</span> : null}
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10 print:border-[#ded6ca]">
                <div className="grid grid-cols-[1.7fr_0.55fr_0.8fr_0.8fr] gap-4 bg-white/6 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/60 print:bg-[#f5efe6] print:text-[#5c5247]">
                  <span>Item</span>
                  <span>Cant.</span>
                  <span>Unitario</span>
                  <span>Total</span>
                </div>
                {invoice.items.map((item) => (
                  <div key={`${item.name}-${item.qty}`} className="grid grid-cols-[1.7fr_0.55fr_0.8fr_0.8fr] gap-4 border-t border-white/10 px-4 py-3 text-sm text-white/75 print:border-[#ece4d8] print:text-[#2e2822]">
                    <span>{item.name}</span>
                    <span>{item.qty}</span>
                    <span>{formatCurrency(item.unitPrice)}</span>
                    <span>{formatCurrency(item.lineTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/25 p-5 text-sm text-white/65 print:border-[#ded6ca] print:bg-[#faf6ef] print:text-[#3c342d]">
                <div className="flex items-center justify-between"><span>Subtotal</span><strong className="text-white print:text-[#1a140e]">{formatCurrency(invoice.subtotal)}</strong></div>
                <div className="mt-2 flex items-center justify-between"><span>Envio</span><strong className="text-white print:text-[#1a140e]">{formatCurrency(invoice.shipping)}</strong></div>
                <div className="mt-2 flex items-center justify-between"><span>IVA {Math.round(invoice.ivaRate * 100)}%</span><strong className="text-white print:text-[#1a140e]">{formatCurrency(invoice.ivaAmount)}</strong></div>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-base print:border-[#e6dccf]"><span className="font-semibold text-white print:text-[#1a140e]">Total</span><strong className="text-[#ead7b3] print:text-[#6b4d1d]">{formatCurrency(invoice.total)}</strong></div>
              </div>

              <div className="no-print mt-6">
                <button type="button" className="button-primary" onClick={() => window.print()}>
                  Imprimir
                </button>
              </div>
            </section>
          ) : null}
        </section>
      )}
    </div>
  );
}
