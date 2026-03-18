"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency, formatDate } from "@/lib/format";
import { useAuthStore } from "@/store/auth-store";
import { useHydrated } from "@/hooks/use-hydrated";

export function ProfilePage() {
  const hydrated = useHydrated();
  const auth = useAuthStore((state) => state.auth);

  const ordersQuery = useQuery({
    queryKey: ["my-orders", auth?.user.id],
    queryFn: () => apiClient.getMyOrders(auth!.accessToken),
    enabled: hydrated && !!auth?.accessToken,
  });

  if (!hydrated) {
    return (
      <div className="page-container">
        <section className="section-panel animate-pulse p-8">
          <div className="h-3 w-20 rounded-full bg-white/10" />
          <div className="mt-5 h-8 w-72 rounded-full bg-white/10" />
          <div className="mt-8 h-56 rounded-[1.5rem] bg-white/8" />
        </section>
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="page-container">
        <EmptyState
          icon="user"
          title="Inicia sesion para ver tu perfil"
          description="Tu cuenta conserva JWT, pedidos y reservas con los mismos contratos del backend actual."
          action={
            <Link href="/login" className="button-primary">
              Ir a login
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container space-y-8">
      <PageHeader
        eyebrow="Mi cuenta"
        title="Perfil del cliente"
        description="Resumen de usuario y trazabilidad de pedidos desde el nuevo storefront en Next.js."
      />

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <article className="section-panel p-6">
          <p className="section-eyebrow">Datos</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{auth.user.fullName}</h2>
          <dl className="mt-6 space-y-4 text-sm text-white/65">
            <div>
              <dt className="text-white/40">Email</dt>
              <dd className="mt-1 text-base text-white">{auth.user.email}</dd>
            </div>
            <div>
              <dt className="text-white/40">Telefono</dt>
              <dd className="mt-1 text-base text-white">{auth.user.phone}</dd>
            </div>
            <div>
              <dt className="text-white/40">Roles</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {auth.user.roles.map((role) => (
                  <span key={role} className="rounded-full border border-[#c6a15b]/35 bg-[#c6a15b]/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#e7c98f]">
                    {role}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </article>

        <section className="section-panel p-6">
          <p className="section-eyebrow">Historial</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Pedidos recientes</h2>

          {ordersQuery.isLoading ? (
            <div className="mt-6 space-y-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="animate-pulse rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-5">
                  <div className="h-4 w-40 rounded-full bg-white/10" />
                  <div className="mt-3 h-3 w-24 rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          ) : ordersQuery.isError ? (
            <div className="mt-6 rounded-[1.5rem] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
              {getErrorMessage(ordersQuery.error, "No se pudo cargar el historial de pedidos.")}
            </div>
          ) : ordersQuery.data && ordersQuery.data.length > 0 ? (
            <div className="mt-6 space-y-3">
              {ordersQuery.data.map((order) => (
                <article key={order.id} className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{order.status}</h3>
                      <p className="mt-1 text-sm text-white/50">{formatDate(order.createdAtUtc)}</p>
                      <p className="mt-3 text-sm leading-7 text-white/60">{order.items.length} item(s) en esta orden.</p>
                    </div>
                    <strong className="text-lg text-[#ead7b3]">{formatCurrency(order.totalAmount)}</strong>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="cart"
              title="Aun no tienes pedidos"
              description="Cuando hagas tu primera compra desde el menu, el historial aparecera aqui."
              action={
                <Link href="/catalog" className="button-primary">
                  Ver menu
                </Link>
              }
            />
          )}
        </section>
      </section>
    </div>
  );
}
