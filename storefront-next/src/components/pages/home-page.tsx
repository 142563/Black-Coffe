"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import { Icon } from "@/components/shared/icon";

const HeroScene = dynamic(
  () => import("@/components/home/hero-scene").then((mod) => mod.HeroScene),
  { ssr: false }
);

const fallbackImage =
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80";

export function HomePage() {
  const pathname = usePathname();
  const settingsQuery = useQuery({
    queryKey: ["storefront-settings"],
    queryFn: apiClient.getSettings,
  });

  const featuredQuery = useQuery({
    queryKey: ["featured-menu"],
    queryFn: apiClient.getFeatured,
  });

  const settings = settingsQuery.data;
  const featured = featuredQuery.data ?? [];

  return (
    <div className="relative overflow-hidden bg-black">
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_26%,rgba(192,136,57,0.26),rgba(0,0,0,0)_32%),radial-gradient(circle_at_58%_58%,rgba(168,110,30,0.28),rgba(0,0,0,0)_22%),radial-gradient(circle_at_80%_82%,rgba(88,48,13,0.22),rgba(0,0,0,0)_22%),linear-gradient(180deg,#060504_0%,#050403_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02),transparent_30%,transparent_70%,rgba(255,255,255,0.02))]" />
        <HeroScene key={pathname} />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[90rem] flex-col items-center justify-end px-4 pb-16 pt-36 text-center sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(16px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 1.15, duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.46em] text-[#c6a15b]">
              {settings?.name || "Black Coffe"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22, filter: "blur(16px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 1.35, duration: 0.8, ease: "easeOut" }}
            className="mx-auto mt-11 max-w-4xl"
          >
            <h1 className="text-balance text-[clamp(3rem,6.4vw,5.85rem)] font-extrabold leading-[0.95] tracking-[-0.055em] text-white">
              Mas que una bebida...
            </h1>
            <p className="mt-5 text-[clamp(1.2rem,2vw,2rem)] font-medium text-[#ead8b8]">
              es un estilo de vida.
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              {settings?.businessMessage ||
                settings?.tagline ||
                "Cafe premium, rapido, limpio y pensado para una experiencia boutique desde la primera visita."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.55, duration: 0.7, ease: "easeOut" }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link href="/catalog" className="button-primary">
              Ver menu
            </Link>
            <Link href="/reservations" className="button-secondary">
              Reservar
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="page-container relative z-10 space-y-8 py-20">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              icon: "coffee" as const,
              title: "Menu vivo",
              copy: "Categorias claras, carrito persistente y un flujo de compra mucho mas limpio.",
            },
            {
              icon: "calendar" as const,
              title: "Reserva tu mesa",
              copy: "Agenda visitas con un recorrido mas premium, directo y orientado a conversion.",
            },
            {
              icon: "spark" as const,
              title: "Identidad boutique",
              copy: "El storefront nuevo prioriza atmosfera, motion fino y presencia visual de marca.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="section-panel p-6 transition hover:-translate-y-1 hover:border-white/20"
            >
              <div className="mb-5 inline-flex rounded-2xl border border-white/10 bg-black/40 p-3 text-[#c6a15b]">
                <Icon name={item.icon} />
              </div>
              <h2 className="text-2xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/60">{item.copy}</p>
            </article>
          ))}
        </div>

        {featured.length > 0 ? (
          <section className="section-panel p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-eyebrow">Seleccion</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Favoritos de Black Coffe</h2>
              </div>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:text-white"
              >
                Explorar menu <Icon name="arrow-right" className="size-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {featured.map((item) => (
                <article
                  key={`${item.id}-${item.name}`}
                  className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/35"
                >
                  <div className="aspect-[1.25/1] overflow-hidden">
                    <img
                      src={item.imageUrl.startsWith("/assets/products/") ? fallbackImage : item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-3 p-5">
                    <span className="inline-flex rounded-full border border-[#c6a15b]/40 bg-[#c6a15b]/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#e4c588]">
                      {item.badgeText}
                    </span>
                    <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                    <p className="text-sm text-white/55">Desde {formatCurrency(item.priceFrom)}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </div>
  );
}
