import { stores } from "@/data/stores";
import type { ShippingMethod } from "@/lib/types";

/* Default delivery options. Seeded into the database by scripts/seed.mjs and used directly
   while no database is connected (local dev, demo admin, GitHub Pages export).
   Parcel carriers ship free over 2 000 Kč, like the current elektrodvorak.cz. */

const T = (cs: string, en: string) => ({ cs, en });

/** One free store-collection method per store; bulky goods allowed. */
export const storePickupMethods: ShippingMethod[] = stores.map((s, i) => ({
  id: `pickup_${s.id}`, carrier: "store",
  name: T(`Osobní odběr · ${s.city}`, `Store collection · ${s.city}`),
  description: T(`${s.street} · ${s.hours.cs}`, `${s.street} · ${s.hours.en}`),
  price: 0, free_over: null, enabled: true, needs_pickup_point: false, bulky: true, sort: i,
}));

export const defaultShippingMethods: ShippingMethod[] = [
  ...storePickupMethods,
  { id: "own_delivery", carrier: "delivery", name: T("Vlastní doprava a zapojení", "Our own delivery and installation"), description: T("Velké spotřebiče a zahradní stroje po Vysočině a Pardubickém kraji, odvoz starého spotřebiče zdarma.", "Large appliances and garden machines across Vysočina and the Pardubice region; old appliance removed free."), price: 490, free_over: 15000, enabled: true, needs_pickup_point: false, bulky: true, sort: 10 },
  { id: "packeta_point", carrier: "packeta", name: T("Zásilkovna – výdejní místo", "Packeta pickup point"), description: T("Balíky do 10 kg.", "Parcels up to 10 kg."), price: 79, free_over: 2000, enabled: true, needs_pickup_point: true, bulky: false, sort: 11 },
  { id: "packeta_home", carrier: "packeta", name: T("Zásilkovna – na adresu", "Packeta home delivery"), description: T("", ""), price: 109, free_over: 2000, enabled: true, needs_pickup_point: false, bulky: false, sort: 12 },
  { id: "ppl", carrier: "ppl", name: T("PPL – na adresu", "PPL to address"), description: T("", ""), price: 129, free_over: 2000, enabled: true, needs_pickup_point: false, bulky: false, sort: 13 },
  { id: "dpd", carrier: "dpd", name: T("DPD – na adresu", "DPD to address"), description: T("", ""), price: 129, free_over: 2000, enabled: false, needs_pickup_point: false, bulky: false, sort: 14 },
  { id: "ceska_posta", carrier: "ceska_posta", name: T("Česká pošta – Balík do ruky", "Czech Post parcel"), description: T("", ""), price: 119, free_over: 2000, enabled: true, needs_pickup_point: false, bulky: false, sort: 15 },
  { id: "gls", carrier: "gls", name: T("GLS – na adresu", "GLS to address"), description: T("", ""), price: 119, free_over: 2000, enabled: true, needs_pickup_point: false, bulky: false, sort: 16 },
  { id: "fofr", carrier: "fofr", name: T("FOFR – paletová přeprava", "FOFR pallet freight"), description: T("Velké spotřebiče a stroje mimo náš rozvozový region.", "Large appliances and machines outside our delivery region."), price: 890, free_over: null, enabled: true, needs_pickup_point: false, bulky: true, sort: 17 },
];

export const defaultPaymentMethods = [
  { id: "stripe", name: T("Platební karta (Stripe)", "Card (Stripe)"), enabled: true, sort: 0 },
  { id: "gopay", name: T("GoPay", "GoPay"), enabled: false, sort: 1 },
  { id: "comgate", name: T("Comgate", "Comgate"), enabled: false, sort: 2 },
  { id: "paypal", name: T("PayPal", "PayPal"), enabled: false, sort: 3 },
  { id: "bank_transfer", name: T("Bankovní převod", "Bank transfer"), enabled: true, sort: 4 },
  { id: "cash", name: T("Hotově nebo kartou při odběru", "Cash or card on collection"), enabled: true, sort: 5 },
];
