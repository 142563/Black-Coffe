"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/shared/empty-state";
import { Icon } from "@/components/shared/icon";
import { PageHeader } from "@/components/shared/page-header";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency } from "@/lib/format";
import type { MenuCategory, MenuOption, MenuRow, MenuSection } from "@/lib/types";
import { getCartItemsCount, getCartIvaAmount, getCartSubtotal, useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { useHydrated } from "@/hooks/use-hydrated";

interface MenuCategoryView {
  key: string;
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
  section?: MenuSection;
}

interface ProductCardView {
  key: string;
  title: string;
  note?: string | null;
  options: MenuOption[];
}

const fallbackCategories: MenuCategoryView[] = [
  { key: "hot", label: "Hot Drinks", icon: "cup" },
  { key: "cold", label: "Cold Drinks", icon: "spark" },
  { key: "savory", label: "Food - Savory", icon: "coffee" },
  { key: "sweet", label: "Food - Sweet", icon: "check" },
];

function mapCategoryKey(sectionKey: string) {
  if (sectionKey.includes("hot")) return "hot";
  if (sectionKey.includes("cold")) return "cold";
  if (sectionKey.includes("savory")) return "savory";
  return "sweet";
}

function buildCategoryViews(categories: MenuCategory[]) {
  const iconMap: Record<string, MenuCategoryView["icon"]> = {
    hot: "cup",
    cold: "spark",
    savory: "coffee",
    sweet: "check",
  };

  if (!categories.length) {
    return fallbackCategories;
  }

  return categories
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      key: item.key,
      label: item.name,
      icon: iconMap[item.iconKey] ?? "spark",
    }));
}

function cardFromRow(section: MenuSection, row: MenuRow, index: number): ProductCardView | null {
  if (!row.options.length) {
    return null;
  }

  return {
    key: `${section.key}-${index}`,
    title: row.label.replace("*", "").trim(),
    note: row.note,
    options: row.options,
  };
}

export function CatalogPage() {
  const hydrated = useHydrated();
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const setCartDrawerOpen = useUiStore((state) => state.setCartDrawerOpen);
  const pushToast = useUiStore((state) => state.pushToast);
  const [activeCategory, setActiveCategory] = useState("hot");
  const [selectedOptionIds, setSelectedOptionIds] = useState<Record<string, string>>({});
  const [draftQuantities, setDraftQuantities] = useState<Record<string, number>>({});
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const menuQuery = useQuery({
    queryKey: ["menu-board"],
    queryFn: apiClient.getMenuBoard,
  });

  const categoriesQuery = useQuery({
    queryKey: ["menu-categories"],
    queryFn: apiClient.getMenuCategories,
  });

  const categories = useMemo(() => buildCategoryViews(categoriesQuery.data ?? []), [categoriesQuery.data]);
  const sections = menuQuery.data?.sections ?? [];

  const cardsByCategory = useMemo(() => {
    return categories
      .map((category) => ({
        ...category,
        section: sections.find((section) => mapCategoryKey(section.key) === category.key),
      }))
      .filter((category) => !!category.section?.rows.length);
  }, [categories, sections]);

  const cartQuantities = useMemo(() => {
    return (hydrated ? cartItems : []).reduce<Record<string, number>>((acc, item) => {
      acc[item.productId] = item.quantity;
      return acc;
    }, {});
  }, [cartItems, hydrated]);

  const cartItemCount = hydrated ? getCartItemsCount(cartItems) : 0;
  const cartSubtotal = hydrated ? getCartSubtotal(cartItems) : 0;
  const cartIva = hydrated ? getCartIvaAmount(cartItems) : 0;

  useEffect(() => {
    if (!cardsByCategory.length) {
      return;
    }

    setActiveCategory(cardsByCategory[0].key);

    const nextSelected: Record<string, string> = {};
    const nextDrafts: Record<string, number> = {};

    for (const category of cardsByCategory) {
      const section = category.section;
      if (!section) continue;
      section.rows.forEach((row, index) => {
        const card = cardFromRow(section, row, index);
        if (!card) return;
        nextSelected[card.key] = card.options[0].productId;
        nextDrafts[card.key] = 1;
      });
    }

    setSelectedOptionIds(nextSelected);
    setDraftQuantities(nextDrafts);
  }, [cardsByCategory]);

  useEffect(() => {
    const nodes = Object.values(sectionRefs.current).filter(Boolean) as HTMLElement[];
    if (!nodes.length || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const next = visible[0]?.target.getAttribute("data-category");
        if (next) {
          setActiveCategory(next);
        }
      },
      {
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0.25, 0.45, 0.7],
      }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [cardsByCategory]);

  const loading = menuQuery.isLoading || categoriesQuery.isLoading || !hydrated;
  const error = menuQuery.error ?? categoriesQuery.error;

  function selectedOption(card: ProductCardView) {
    return card.options.find((option) => option.productId === selectedOptionIds[card.key]) ?? card.options[0];
  }

  function setDraft(cardKey: string, nextValue: number) {
    setDraftQuantities((current) => ({
      ...current,
      [cardKey]: Math.min(20, Math.max(1, nextValue)),
    }));
  }

  function scrollToCategory(categoryKey: string) {
    const element = document.getElementById(`menu-section-${categoryKey}`);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveCategory(categoryKey);
  }

  if (loading) {
    return (
      <div className="page-container space-y-8">
        <PageHeader
          eyebrow="Menu"
          title="Cargando la carta"
          description="Estamos preparando el menu interactivo para el nuevo storefront."
        />
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="section-panel animate-pulse p-6">
              <div className="h-3 w-24 rounded-full bg-white/10" />
              <div className="mt-5 h-7 w-2/3 rounded-full bg-white/10" />
              <div className="mt-6 h-10 rounded-2xl bg-white/8" />
              <div className="mt-6 h-24 rounded-[1.5rem] bg-white/6" />
            </div>
          ))}
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <EmptyState
          icon="coffee"
          title="No se pudo cargar el menu"
          description={getErrorMessage(error, "Revisa la API y vuelve a intentarlo.")}
          action={
            <button type="button" className="button-primary" onClick={() => menuQuery.refetch()}>
              Reintentar
            </button>
          }
        />
      </div>
    );
  }

  if (!cardsByCategory.length) {
    return (
      <div className="page-container">
        <EmptyState
          icon="coffee"
          title="No hay productos por el momento"
          description="Cuando el menu tenga items activos apareceran aqui con chips, cantidad y carrito persistente."
          action={
            <button type="button" className="button-primary" onClick={() => menuQuery.refetch()}>
              Recargar menu
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container space-y-8 pb-32">
      <PageHeader
        eyebrow="Menu"
        title="Carta interactiva"
        description="Elige categoria, tamano y cantidad. Todo queda sincronizado con tu carrito y tu checkout comercial."
        actions={
          <Link href="/cart" className="button-secondary">
            Ir al carrito
          </Link>
        }
      />

      <div className="sticky top-24 z-20 -mx-2 overflow-x-auto px-2">
        <div className="inline-flex min-w-full gap-3 rounded-full border border-white/10 bg-black/35 p-2 backdrop-blur md:min-w-max">
          {cardsByCategory.map((category) => (
            <button
              key={category.key}
              type="button"
              className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
                activeCategory === category.key
                  ? "bg-[#c6a15b] text-black"
                  : "text-white/72 hover:bg-white/8 hover:text-white"
              }`}
              onClick={() => scrollToCategory(category.key)}
            >
              <Icon name={category.icon} className="size-4" />
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {cardsByCategory.map((category) => {
          const section = category.section;
          if (!section) return null;

          const cards = section.rows
            .map((row, index) => cardFromRow(section, row, index))
            .filter((card): card is ProductCardView => !!card);

          return (
            <section
              key={category.key}
              id={`menu-section-${category.key}`}
              data-category={category.key}
              ref={(node) => {
                sectionRefs.current[category.key] = node;
              }}
              className="space-y-4"
            >
              <div className="section-panel flex flex-col gap-3 p-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-eyebrow">{category.label}</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">{section.title}</h2>
                </div>
                {section.note ? <p className="max-w-xl text-sm leading-7 text-white/58">{section.note}</p> : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => {
                  const option = selectedOption(card);
                  const quantityInCart = cartQuantities[option.productId] ?? 0;
                  const draftQty = draftQuantities[card.key] ?? 1;

                  return (
                    <article key={card.key} className="section-panel flex flex-col p-6 transition hover:-translate-y-1 hover:border-white/20">
                      <div>
                        <h3 className="text-2xl font-semibold text-white">{card.title}</h3>
                        {card.note ? <p className="mt-2 text-sm leading-7 text-white/55">{card.note}</p> : null}
                      </div>

                      <div className="mt-6 flex flex-wrap gap-2">
                        {card.options.map((item) => {
                          const active = option.productId === item.productId;
                          return (
                            <button
                              key={item.productId}
                              type="button"
                              disabled={!item.available}
                              onClick={() => setSelectedOptionIds((current) => ({ ...current, [card.key]: item.productId }))}
                              className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition ${
                                active
                                  ? "border-[#c6a15b]/60 bg-[#c6a15b] text-black"
                                  : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:text-white"
                              } ${!item.available ? "cursor-not-allowed opacity-45" : ""}`}
                            >
                              {item.sizeLabel.toLowerCase() === "unit" ? "Unidad" : item.sizeLabel}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-4 rounded-[1.4rem] border border-white/10 bg-black/30 px-4 py-4">
                        <div>
                          <strong className="text-xl text-[#ead7b3]">{formatCurrency(option.price)}</strong>
                          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/40">
                            {quantityInCart} en carrito
                          </p>
                        </div>
                        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] p-1">
                          <button
                            type="button"
                            className="grid size-9 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
                            onClick={() => setDraft(card.key, draftQty - 1)}
                          >
                            -
                          </button>
                          <span className="min-w-10 text-center text-sm font-semibold text-white">{draftQty}</span>
                          <button
                            type="button"
                            className="grid size-9 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
                            onClick={() => setDraft(card.key, draftQty + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={!option.available}
                        className="button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-45"
                        onClick={() => {
                          addItem({
                            productId: option.productId,
                            name: option.label,
                            unitPrice: option.price,
                            quantity: draftQty,
                          });
                          setDraft(card.key, 1);
                          pushToast({
                            tone: "success",
                            title: `${option.label} agregado`,
                            description: `${draftQty} item${draftQty === 1 ? "" : "s"} enviados al carrito.`,
                          });
                        }}
                      >
                        Agregar al carrito
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {cartItemCount > 0 ? (
        <div className="no-print fixed inset-x-4 bottom-4 z-40 md:left-1/2 md:right-auto md:w-[min(42rem,calc(100vw-2rem))] md:-translate-x-1/2">
          <div className="section-panel flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <strong className="text-lg text-white">{cartItemCount} items listos para checkout</strong>
              <p className="mt-1 text-sm text-white/58">
                Subtotal {formatCurrency(cartSubtotal)} | IVA {formatCurrency(cartIva)}
              </p>
            </div>
            <div className="flex gap-3">
              <button type="button" className="button-secondary" onClick={() => setCartDrawerOpen(true)}>
                Ver carrito
              </button>
              <Link href="/checkout" className="button-primary">
                Checkout
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

