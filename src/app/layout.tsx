import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";
import { SettingsProvider, type SiteSettings } from "@/lib/settings";
import { getSetting } from "@/lib/data";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Elektro Dvořák · Elektro, domácí spotřebiče, nářadí a zahrada",
  description: "Prodejny a e-shop elektro, domácích spotřebičů, počítačů, nářadí a zahradní techniky. Šest prodejen na Vysočině a v Pardubickém kraji, doprava zdarma od 2 000 Kč.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [store, announcement, theme] = await Promise.all([
    getSetting<SiteSettings["store"]>("store"), getSetting<SiteSettings["announcement"]>("announcement"), getSetting<SiteSettings["theme"]>("theme"),
  ]);
  const settings: SiteSettings = { store, announcement, theme };
  const vars = [theme?.accent && `--color-ink:${theme.accent}`, theme?.signal && `--color-signal:${theme.signal}`, theme?.font && theme.font !== "Inter" && `--font-sans:"${theme.font}",Inter Variable,sans-serif`].filter(Boolean).join(";");
  return (
    <html lang="cs">
      {vars ? <head><style>{`:root{${vars}}`}</style></head> : null}
      <body>
        <LangProvider>
          <SettingsProvider value={settings}>
            <CartProvider>
              <Header />
              <main>{children}</main>
              <Footer />
            </CartProvider>
          </SettingsProvider>
        </LangProvider>
      </body>
    </html>
  );
}
