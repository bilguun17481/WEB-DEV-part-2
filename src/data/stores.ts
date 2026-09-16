import type { Text } from "@/lib/types";

/** Elektro Dvořák stores. Also used as store-collection shipping methods (id `pickup_<id>`).
    Opening hours as listed in public directories (Firmy.cz, Živéfirmy, VARI dealer list) in September 2026. */
export interface Store {
  id: string;
  name: string;
  city: string;
  street: string;
  zip: string;
  phones: string[];
  email: string;
  hours: Text;
  /** What the store carries beyond the electro core range. */
  range: Text;
  main?: boolean;
}

export const stores: Store[] = [
  {
    id: "jenikov", main: true,
    name: "Elektro Železářství Dvořák Golčův Jeníkov", city: "Golčův Jeníkov",
    street: "Havlíčkovo náměstí 133", zip: "582 82",
    phones: ["+420 601 382 804", "+420 569 442 203"], email: "jenikov@elektrodvorak.cz",
    hours: { cs: "Po–Pá 8:00–17:00 · So 8:00–11:30", en: "Mon–Fri 8:00–17:00 · Sat 8:00–11:30" },
    range: { cs: "Elektro, počítače, hobby, zahrada a železářství", en: "Electro, computers, hobby, garden and hardware" },
  },
  {
    id: "caslav",
    name: "Elektro Dvořák Čáslav", city: "Čáslav",
    street: "nám. Jana Žižky z Trocnova 163/41", zip: "286 01",
    phones: ["+420 601 382 809", "+420 327 314 655"], email: "caslav@elektrodvorak.cz",
    hours: { cs: "Po–Pá 8:00–12:00, 13:00–17:00 · So 8:00–11:00", en: "Mon–Fri 8:00–12:00, 13:00–17:00 · Sat 8:00–11:00" },
    range: { cs: "Elektro, počítače, foto a elektrické nářadí", en: "Electro, computers, photo and power tools" },
  },
  {
    id: "chotebor",
    name: "Elektro Železářství Dvořák Chotěboř", city: "Chotěboř",
    street: "Náměstí T. G. Masaryka 56", zip: "583 01",
    phones: ["+420 601 382 806", "+420 569 622 053"], email: "chotebor@elektrodvorak.cz",
    hours: { cs: "Po–Pá 8:00–17:00 · So 8:00–11:00", en: "Mon–Fri 8:00–17:00 · Sat 8:00–11:00" },
    range: { cs: "Elektro, počítače, foto a zahradní technika", en: "Electro, computers, photo and garden machinery" },
  },
  {
    id: "svetla",
    name: "Elektro Dvořák Světlá nad Sázavou", city: "Světlá nad Sázavou",
    street: "Náměstí Trčků z Lípy 515", zip: "582 91",
    phones: ["+420 601 382 807", "+420 569 456 771"], email: "svetla@elektrodvorak.cz",
    hours: { cs: "Po–Pá 8:00–12:00, 13:00–17:00 · So 8:00–11:00", en: "Mon–Fri 8:00–12:00, 13:00–17:00 · Sat 8:00–11:00" },
    range: { cs: "Elektro, počítače, foto a domácí potřeby", en: "Electro, computers, photo and housewares" },
  },
  {
    id: "tremosnice",
    name: "Elektro Železářství Dvořák Třemošnice", city: "Třemošnice",
    street: "Náměstí Míru 491", zip: "538 43",
    phones: ["+420 601 382 805", "+420 469 661 386"], email: "tremosnice@elektrodvorak.cz",
    hours: { cs: "Po–Pá 8:00–17:00 · So 8:00–11:00", en: "Mon–Fri 8:00–17:00 · Sat 8:00–11:00" },
    range: { cs: "Elektro, počítače, foto a elektrické nářadí", en: "Electro, computers, photo and power tools" },
  },
  {
    id: "hermanuv-mestec",
    name: "Elektro Dvořák Heřmanův Městec", city: "Heřmanův Městec",
    street: "náměstí Míru 176", zip: "538 03",
    phones: ["+420 605 222 936"], email: "hermanuvmestec@elektrodvorak.cz",
    hours: { cs: "Po–Pá 8:00–17:00 · So 8:00–11:00", en: "Mon–Fri 8:00–17:00 · Sat 8:00–11:00" },
    range: { cs: "Elektro, počítače a hobby", en: "Electro, computers and hobby" },
  },
];

/** Company-wide contacts (e-shop customer line and registered office). */
export const company = {
  name: "Elektro Dvořák",
  legal: "Dvořák a synové, s.r.o.",
  ico: "17540780",
  dic: "CZ17540780",
  seat: "Červenkova 527/2, 182 00 Praha 8",
  /** Operations and warehouse; used as the parcel pickup address for carrier labels. */
  warehouse: { street: "Nádraží", houseNumber: "604", city: "Golčův Jeníkov", zip: "582 82" },
  address: "Nádraží 604, 582 82 Golčův Jeníkov",
  phone: "+420 702 521 521",
  email: "eshop@elektrodvorak.cz",
  hours: { cs: "Pondělí až pátek 7:30 – 15:00", en: "Monday to Friday 7:30 – 15:00" },
  since: 1990,
};

export const storeById = (id: string) => stores.find((s) => s.id === id);
