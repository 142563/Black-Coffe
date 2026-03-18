"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { ToastRegion } from "@/components/shared/toast-region";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      <Header />
      <main
        key={pathname}
        className={cn(
          "flex-1",
          isHome ? "bg-black" : "bg-[radial-gradient(circle_at_top,#201208_0%,#0b0705_46%,#060505_100%)] pt-32 pb-20"
        )}
      >
        {children}
      </main>
      <CartDrawer />
      <ToastRegion />
    </>
  );
}
