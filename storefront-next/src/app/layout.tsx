import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "@/components/providers/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Black Coffe",
    template: "%s | Black Coffe",
  },
  description:
    "Storefront premium para Black Coffe: menu, carrito, checkout, reservas y experiencia de marca cinematografica.",
  icons: {
    icon: "/brand/logo-black-coffe.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable} h-full bg-[#050403] antialiased`}>
      <body className="min-h-full bg-[#050403] text-[#f8f2e9]">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
