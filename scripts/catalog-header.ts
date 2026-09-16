export type Category = "televize-audio" | "velke-spotrebice" | "male-spotrebice" | "pocitace-telefony" | "naradi" | "zahrada";
/** EU energy label class (2021 scale). "—" for products without a label (tools, phones, accessories). */
export type EnergyClass = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "—";
/** A colour option: a plain hex string, or an object that can also name the colour and point at the photo it opens. */
export type ProductColor = string | { hex: string; name?: string; image?: string };
export const colorHex = (c: ProductColor) => (typeof c === "string" ? c : c.hex);
export const colorName = (c: ProductColor) => (typeof c === "string" ? undefined : c.name);
export const colorImage = (c: ProductColor) => (typeof c === "string" ? undefined : c.image); // legacy placeholder hint, unused by the photo tiles

export interface Product {
  slug: string;
  brand: string;
  category: Category;
  name: string;
  price: number;        // Kč incl. VAT
  oldPrice?: number;
  energy: EnergyClass;
  tags?: ("new" | "sale" | "demo")[];
  power?: string;       // e.g. "1 800 W" or "18 V"
  size?: string;        // headline dimension: screen diagonal, drum capacity, volume, working width…
  short: { cs: string; en: string };
  specs: { label: { cs: string; en: string }; value: string }[];
  colors: ProductColor[]; // swatches, optionally with a name and a landing photo
  /** Product page on elektrodvorak.cz this entry was built from. */
  source?: string;
}

export const categories: {
  slug: Category;
  label: { cs: string; en: string };
  /** Short label for the header navigation. */
  nav: { cs: string; en: string };
  blurb: { cs: string; en: string };
  /** Bulky goods: delivered by our own van or pallet freight, or collected in a store. */
  bulky: boolean;
}[] = [
  {
    slug: "televize-audio",
    label: { cs: "Televize a audio", en: "TV and audio" },
    nav: { cs: "Televize", en: "TV" },
    blurb: {
      cs: "QLED a LED televize JVC, Sencor a TCL od 32 do 65 palců, rádia s DAB+ a reproduktory. Naladíme a zapojíme přímo u vás.",
      en: "JVC, Sencor and TCL QLED and LED televisions from 32 to 65 inches, DAB+ radios and speakers. We tune and set up at your home.",
    },
    bulky: false,
  },
  {
    slug: "velke-spotrebice",
    label: { cs: "Velké spotřebiče", en: "Large appliances" },
    nav: { cs: "Spotřebiče", en: "Appliances" },
    blurb: {
      cs: "Pračky, sušičky, chladničky, myčky, sporáky a vestavné trouby Gorenje, Philco, Romo, Hisense, Brandt a Mora. Dovezeme, zapojíme a starý spotřebič odvezeme.",
      en: "Gorenje, Philco, Romo, Hisense, Brandt and Mora washers, dryers, fridges, dishwashers, cookers and built-in ovens. Delivered, installed, and your old appliance taken away.",
    },
    bulky: true,
  },
  {
    slug: "male-spotrebice",
    label: { cs: "Malé spotřebiče", en: "Small appliances" },
    nav: { cs: "Domácnost", en: "Home" },
    blurb: {
      cs: "Kuchyňské roboty a vysavače ETA, kávovary De'Longhi a Philips, fritézy, konvice, žehličky a péče o tělo. Skladem na všech prodejnách.",
      en: "ETA kitchen machines and vacuums, De'Longhi and Philips coffee machines, air fryers, kettles, irons and personal care. In stock at every store.",
    },
    bulky: false,
  },
  {
    slug: "pocitace-telefony",
    label: { cs: "Počítače a telefony", en: "Computers and phones" },
    nav: { cs: "Počítače", en: "Computers" },
    blurb: {
      cs: "Notebooky ASUS, HP a Lenovo, telefony Xiaomi a ZTE, tiskárny Canon a HP a síťové prvky. Nastavení a přenos dat na prodejně.",
      en: "ASUS, HP and Lenovo laptops, Xiaomi and ZTE phones, Canon and HP printers and networking. Set-up and data transfer in store.",
    },
    bulky: false,
  },
  {
    slug: "naradi",
    label: { cs: "Elektrické a aku nářadí", en: "Power and cordless tools" },
    nav: { cs: "Nářadí", en: "Tools" },
    blurb: {
      cs: "Vrtačky, brusky, kladiva, hoblíky a kompresory Einhell, Graphite, Makita, Bosch a Scheppach pro dílnu i profesionály. Železářství v Golčově Jeníkově, Chotěboři a Třemošnici.",
      en: "Einhell, Graphite, Makita, Bosch and Scheppach drills, grinders, hammers, planers and compressors for the workshop and the trade. Hardware stores in Golčův Jeníkov, Chotěboř and Třemošnice.",
    },
    bulky: false,
  },
  {
    slug: "zahrada",
    label: { cs: "Zahradní technika", en: "Garden machinery" },
    nav: { cs: "Zahrada", en: "Garden" },
    blurb: {
      cs: "Traktory a sekačky VARI, AL-KO a EGO, pily, plotostřihy, čerpadla, štípače a drtiče. Prodej, sestavení a autorizovaný servis VARI.",
      en: "VARI, AL-KO and EGO tractors and mowers, saws, hedge trimmers, pumps, log splitters and shredders. Sales, assembly and authorised VARI service.",
    },
    bulky: true,
  },
];

export const brands = ["Sencor", "JVC", "ETA", "Philco", "Romo", "Gorenje", "Xiaomi", "ASUS", "Einhell", "Graphite", "VARI", "AL-KO"] as const;

/** Whether a category's products need bulky-goods delivery (own van, pallet) or store collection. */
export const isBulky = (category: string) => categories.find((c) => c.slug === category)?.bulky ?? false;

const L = (cs: string, en: string) => ({ cs, en });
