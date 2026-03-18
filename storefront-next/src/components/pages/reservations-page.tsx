"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { apiClient } from "@/lib/api-client";
import { getErrorStatus, getErrorMessage } from "@/lib/error";
import { useAuthStore } from "@/store/auth-store";
import { useUiStore } from "@/store/ui-store";
import { useHydrated } from "@/hooks/use-hydrated";

export function ReservationsPage() {
  const hydrated = useHydrated();
  const auth = useAuthStore((state) => state.auth);
  const pushToast = useUiStore((state) => state.pushToast);

  const [tableId, setTableId] = useState("");
  const [reservationAt, setReservationAt] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const tablesQuery = useQuery({
    queryKey: ["reservation-tables", auth?.user.id],
    queryFn: () => apiClient.getTables(auth!.accessToken),
    enabled: hydrated && !!auth?.accessToken,
  });

  useEffect(() => {
    if (!tablesQuery.data?.length) return;
    setTableId((current) => current || tablesQuery.data[0].id);
  }, [tablesQuery.data]);

  const tablesErrorMessage = useMemo(() => {
    if (!tablesQuery.error) return "";
    const status = getErrorStatus(tablesQuery.error);
    if (status === 403) {
      return "Tu usuario no puede consultar mesas todavia. Debemos habilitar reservas publicas o asignarte Staff/Admin en backend.";
    }
    return getErrorMessage(tablesQuery.error, "No se pudieron cargar las mesas.");
  }, [tablesQuery.error]);

  async function submitReservation() {
    if (!auth?.accessToken || !tableId || !reservationAt) {
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.createReservation(
        {
          tableId,
          reservationAtUtc: new Date(reservationAt).toISOString(),
          partySize: Number(partySize),
          notes,
        },
        auth.accessToken
      );

      setNotes("");
      setPartySize(1);
      pushToast({ tone: "success", title: "Reserva confirmada", description: "Tu visita ya quedo registrada." });
    } catch (error) {
      const nextMessage = getErrorMessage(error, "No se pudo crear la reserva.");
      pushToast({ tone: "error", title: "Reserva no creada", description: nextMessage });
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="page-container">
        <section className="section-panel animate-pulse p-8">
          <div className="h-3 w-24 rounded-full bg-white/10" />
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
          icon="calendar"
          title="Inicia sesion para reservar"
          description="Las reservas se mantienen sobre la misma API actual. Solo cambiamos la experiencia del storefront."
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
        eyebrow="Reservas"
        title="Reserva tu mesa"
        description="Selecciona mesa, fecha y cantidad de personas. El flujo sigue conectado a la API .NET actual."
      />

      {tablesQuery.isLoading ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="section-panel animate-pulse p-6">
              <div className="h-3 w-20 rounded-full bg-white/10" />
              <div className="mt-5 h-7 w-2/3 rounded-full bg-white/10" />
              <div className="mt-6 h-24 rounded-[1.5rem] bg-white/6" />
            </div>
          ))}
        </section>
      ) : tablesQuery.data && tablesQuery.data.length > 0 ? (
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="section-panel p-6">
            <p className="section-eyebrow">Mesas</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Disponibles</h2>
            <div className="mt-6 space-y-3">
              {tablesQuery.data.map((table) => (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => setTableId(table.id)}
                  className={`w-full rounded-[1.4rem] border px-4 py-4 text-left transition ${
                    tableId === table.id
                      ? "border-[#c6a15b]/50 bg-[#c6a15b]/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  }`}
                >
                  <strong className="text-lg text-white">{table.name}</strong>
                  <p className="mt-1 text-sm text-white/55">Capacidad {table.capacity} | Estado {table.status}</p>
                </button>
              ))}
            </div>
          </article>

          <form
            className="section-panel space-y-4 p-6"
            onSubmit={(event) => {
              event.preventDefault();
              void submitReservation();
            }}
          >
            <input className="input-field" type="datetime-local" value={reservationAt} onChange={(e) => setReservationAt(e.target.value)} required />
            <input className="input-field" type="number" min={1} value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} required />
            <textarea className="input-field min-h-32 resize-y" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas" />
            <button type="submit" className="button-primary w-full" disabled={submitting || !tableId || !reservationAt}>
              {submitting ? "Creando reserva" : "Crear reserva"}
            </button>
          </form>
        </section>
      ) : (
        <EmptyState
          icon="calendar"
          title="No hay mesas disponibles"
          description={tablesErrorMessage || "No hay mesas visibles en este momento. Intenta mas tarde o revisa permisos del usuario."}
          action={
            <button type="button" className="button-primary" onClick={() => tablesQuery.refetch()}>
              Reintentar
            </button>
          }
        />
      )}
    </div>
  );
}
