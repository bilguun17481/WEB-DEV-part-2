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
      cs: "OLED, QLED a LED televize od 32 do 85 palců, soundbary a domácí audio. Naladíme a zapojíme přímo u vás.",
      en: "OLED, QLED and LED televisions from 32 to 85 inches, soundbars and home audio. We tune and set up at your home.",
    },
    bulky: false,
  },
  {
    slug: "velke-spotrebice",
    label: { cs: "Velké spotřebiče", en: "Large appliances" },
    nav: { cs: "Spotřebiče", en: "Appliances" },
    blurb: {
      cs: "Pračky, sušičky, chladničky, myčky, sporáky a varné desky. Dovezeme, zapojíme a starý spotřebič odvezeme.",
      en: "Washers, dryers, fridges, dishwashers, cookers and hobs. Delivered, installed, and your old appliance taken away.",
    },
    bulky: true,
  },
  {
    slug: "male-spotrebice",
    label: { cs: "Malé spotřebiče", en: "Small appliances" },
    nav: { cs: "Domácnost", en: "Home" },
    blurb: {
      cs: "Vysavače, kávovary, kuchyňské roboty, fritézy, žehličky a péče o tělo. Skladem na všech prodejnách.",
      en: "Vacuums, coffee machines, kitchen machines, air fryers, irons and personal care. In stock at every store.",
    },
    bulky: false,
  },
  {
    slug: "pocitace-telefony",
    label: { cs: "Počítače a telefony", en: "Computers and phones" },
    nav: { cs: "Počítače", en: "Computers" },
    blurb: {
      cs: "Notebooky, tablety, mobilní telefony, monitory, tiskárny a síťové prvky. Nastavení a přenos dat na prodejně.",
      en: "Laptops, tablets, phones, monitors, printers and networking. Set-up and data transfer in store.",
    },
    bulky: false,
  },
  {
    slug: "naradi",
    label: { cs: "Elektrické a aku nářadí", en: "Power and cordless tools" },
    nav: { cs: "Nářadí", en: "Tools" },
    blurb: {
      cs: "Vrtačky, brusky, pily a aku systémy Makita, Bosch a Narex pro dílnu i profesionály. Autorizovaný servis Narex.",
      en: "Drills, grinders, saws and Makita, Bosch and Narex cordless systems for the workshop and the trade. Authorised Narex service.",
    },
    bulky: false,
  },
  {
    slug: "zahrada",
    label: { cs: "Zahradní technika", en: "Garden machinery" },
    nav: { cs: "Zahrada", en: "Garden" },
    blurb: {
      cs: "Sekačky, kultivátory, řetězové pily, robotické sekačky a sněhové frézy. Prodej, montáž a servis VARI a Husqvarna.",
      en: "Mowers, tillers, chainsaws, robotic mowers and snow throwers. Sales, assembly and service for VARI and Husqvarna.",
    },
    bulky: true,
  },
];

export const brands = ["Samsung", "LG", "Philips", "Bosch", "Whirlpool", "Gorenje", "ETA", "Tefal", "Makita", "Narex", "VARI", "Husqvarna"] as const;

/** Whether a category's products need bulky-goods delivery (own van, pallet) or store collection. */
export const isBulky = (category: string) => categories.find((c) => c.slug === category)?.bulky ?? false;

const L = (cs: string, en: string) => ({ cs, en });
const WHITE = { hex: "#f4f4f2", name: "Bílá" };
const INOX = { hex: "#b9bcc0", name: "Nerez" };
const BLACK = { hex: "#1f1f1f", name: "Černá" };
const GRAPHITE = { hex: "#4a4d52", name: "Grafitová" };
const MAKITA = "#00a19a";
const BOSCH_BLUE = "#0a4f9e";
const BOSCH_GREEN = "#2e8b3d";
const NAREX = "#d71920";
const VARI = "#e30613";
const HUSQ = "#f37021";

export const products: Product[] = [
  // ───────────────────────── TELEVIZE A AUDIO ─────────────────────────
  {
    slug: "lg-oled65b4",
    brand: "LG", category: "televize-audio", name: "OLED 65\" B4 4K",
    price: 32990, oldPrice: 36990, energy: "F", size: "65\" · 164 cm", tags: ["sale"],
    short: L("Dokonalá černá a 120 Hz pro filmy i konzole. Procesor α8, Dolby Vision a webOS s českými aplikacemi.", "Perfect blacks and 120 Hz for films and consoles. α8 processor, Dolby Vision and webOS with Czech apps."),
    specs: [
      { label: L("Úhlopříčka", "Screen size"), value: "65\" (164 cm)" },
      { label: L("Panel", "Panel"), value: "OLED, 3840 × 2160, 120 Hz" },
      { label: L("HDR", "HDR"), value: "Dolby Vision, HDR10, HLG" },
      { label: L("Konektory", "Connections"), value: "4× HDMI 2.1, 2× USB, LAN, Wi-Fi 5, Bluetooth" },
      { label: L("Tuner", "Tuner"), value: "DVB-T2/HEVC, DVB-S2, DVB-C" },
    ],
    colors: [BLACK],
  },
  {
    slug: "samsung-qe55q70d",
    brand: "Samsung", category: "televize-audio", name: "QLED 55\" Q70D 4K",
    price: 19990, energy: "F", size: "55\" · 138 cm", tags: ["new"],
    short: L("Kvantové tečky a 120 Hz panel v cenově dostupné řadě. Tizen, herní režim a hlasové ovládání.", "Quantum dots and a 120 Hz panel in an affordable range. Tizen, game mode and voice control."),
    specs: [
      { label: L("Úhlopříčka", "Screen size"), value: "55\" (138 cm)" },
      { label: L("Panel", "Panel"), value: "QLED, 3840 × 2160, 120 Hz" },
      { label: L("HDR", "HDR"), value: "HDR10+, HLG, Quantum HDR" },
      { label: L("Konektory", "Connections"), value: "4× HDMI 2.1, 2× USB, LAN, Wi-Fi, Bluetooth" },
    ],
    colors: [BLACK],
  },
  {
    slug: "philips-50pus8909-ambilight",
    brand: "Philips", category: "televize-audio", name: "50\" The One Ambilight 4K",
    price: 13990, energy: "F", size: "50\" · 126 cm",
    short: L("Tříbarevný Ambilight, Google TV a Dolby Atmos. Nejprodávanější televize našich prodejen.", "Three-sided Ambilight, Google TV and Dolby Atmos. The best-selling television in our stores."),
    specs: [
      { label: L("Úhlopříčka", "Screen size"), value: "50\" (126 cm)" },
      { label: L("Panel", "Panel"), value: "LED, 3840 × 2160, 120 Hz" },
      { label: L("Systém", "OS"), value: "Google TV" },
      { label: L("Ambilight", "Ambilight"), value: "3 strany" },
    ],
    colors: [GRAPHITE],
  },
  {
    slug: "sony-kd-43x75wl",
    brand: "Sony", category: "televize-audio", name: "BRAVIA 43\" X75WL 4K",
    price: 12990, energy: "F", size: "43\" · 108 cm",
    short: L("Kompaktní čtyřkovka do ložnice nebo kuchyně. Google TV, Motionflow XR a kvalitní zvuk X-Balanced.", "A compact 4K set for a bedroom or kitchen. Google TV, Motionflow XR and X-Balanced sound."),
    specs: [
      { label: L("Úhlopříčka", "Screen size"), value: "43\" (108 cm)" },
      { label: L("Panel", "Panel"), value: "LED, 3840 × 2160, 50 Hz" },
      { label: L("Systém", "OS"), value: "Google TV" },
    ],
    colors: [BLACK],
  },
  {
    slug: "hisense-75a6n",
    brand: "Hisense", category: "televize-audio", name: "75\" A6N 4K",
    price: 21990, oldPrice: 24990, energy: "F", size: "75\" · 189 cm", tags: ["sale"],
    short: L("Velká obrazovka za rozumné peníze. VIDAA, Dolby Vision a DTS Virtual:X.", "A big screen for sensible money. VIDAA, Dolby Vision and DTS Virtual:X."),
    specs: [
      { label: L("Úhlopříčka", "Screen size"), value: "75\" (189 cm)" },
      { label: L("Panel", "Panel"), value: "LED, 3840 × 2160, 60 Hz" },
      { label: L("Systém", "OS"), value: "VIDAA U7" },
    ],
    colors: [BLACK],
  },
  {
    slug: "sencor-sle-32s801tcsb",
    brand: "Sencor", category: "televize-audio", name: "32\" HD Smart TV",
    price: 4490, energy: "E", size: "32\" · 80 cm",
    short: L("Malá chytrá televize na chatu nebo do dětského pokoje. Android TV, HDMI, USB a DVB-T2.", "A small smart TV for the cottage or a kid's room. Android TV, HDMI, USB and DVB-T2."),
    specs: [
      { label: L("Úhlopříčka", "Screen size"), value: "32\" (80 cm)" },
      { label: L("Panel", "Panel"), value: "LED, 1366 × 768" },
      { label: L("Systém", "OS"), value: "Android TV" },
    ],
    colors: [BLACK],
  },
  {
    slug: "samsung-hw-q600c",
    brand: "Samsung", category: "televize-audio", name: "Soundbar HW-Q600C 3.1.2",
    price: 7990, energy: "—", power: "360 W",
    short: L("Dolby Atmos a bezdrátový subwoofer. S televizí Samsung hraje ve spolupráci Q-Symphony.", "Dolby Atmos and a wireless subwoofer. Plays in Q-Symphony with Samsung TVs."),
    specs: [
      { label: L("Kanály", "Channels"), value: "3.1.2" },
      { label: L("Výkon", "Power"), value: "360 W" },
      { label: L("Připojení", "Connections"), value: "HDMI eARC, optický, Bluetooth" },
    ],
    colors: [BLACK],
  },
  {
    slug: "jbl-bar-2-1-deep-bass-mk2",
    brand: "JBL", category: "televize-audio", name: "Bar 2.1 Deep Bass MK2",
    price: 5490, energy: "—", power: "300 W",
    short: L("Jednoduchý soundbar s pořádným basem. HDMI ARC, Bluetooth a připojení jedním kabelem.", "A simple soundbar with proper bass. HDMI ARC, Bluetooth and a one-cable hook-up."),
    specs: [
      { label: L("Kanály", "Channels"), value: "2.1" },
      { label: L("Výkon", "Power"), value: "300 W" },
      { label: L("Subwoofer", "Subwoofer"), value: "Bezdrátový, 6,5\"" },
    ],
    colors: [BLACK],
  },

  // ───────────────────────── VELKÉ SPOTŘEBIČE ─────────────────────────
  {
    slug: "bosch-wgg244a0by",
    brand: "Bosch", category: "velke-spotrebice", name: "Pračka Serie 6 WGG244A0BY",
    price: 15990, energy: "A", size: "9 kg · 1 400 ot./min", tags: ["new"],
    short: L("Předem plněná pračka s motorem EcoSilence Drive, funkcí i-DOS pro automatické dávkování a programem na 15 minut.", "Front-loading washer with an EcoSilence Drive motor, i-DOS automatic dosing and a 15-minute programme."),
    specs: [
      { label: L("Kapacita", "Capacity"), value: "9 kg" },
      { label: L("Odstřeďování", "Spin"), value: "1 400 ot./min" },
      { label: L("Hlučnost", "Noise"), value: "71 dB (odstřeďování)" },
      { label: L("Rozměry", "Dimensions"), value: "85 × 60 × 59 cm" },
      { label: L("Záruka", "Warranty"), value: "2 roky, motor 10 let" },
    ],
    colors: [WHITE],
  },
  {
    slug: "whirlpool-ffb-7259-bv-ee",
    brand: "Whirlpool", category: "velke-spotrebice", name: "Pračka FreshCare+ FFB 7259",
    price: 9490, oldPrice: 10990, energy: "B", size: "7 kg · 1 200 ot./min", tags: ["sale"],
    short: L("Sedmikilová pračka s technologií 6. smysl a parou FreshCare+, která udrží prádlo svěží až 6 hodin po skončení cyklu.", "A 7 kg washer with 6th Sense and FreshCare+ steam that keeps laundry fresh for up to 6 hours after the cycle."),
    specs: [
      { label: L("Kapacita", "Capacity"), value: "7 kg" },
      { label: L("Odstřeďování", "Spin"), value: "1 200 ot./min" },
      { label: L("Rozměry", "Dimensions"), value: "85 × 60 × 58 cm" },
    ],
    colors: [WHITE],
  },
  {
    slug: "lg-rh90v9avhn",
    brand: "LG", category: "velke-spotrebice", name: "Sušička s tepelným čerpadlem RH90V9",
    price: 17990, energy: "A", size: "9 kg",
    short: L("Sušička DUAL Inverter s tepelným čerpadlem a párou. Spotřeba na hranici třídy A, tichý chod.", "DUAL Inverter heat-pump dryer with steam. Class A consumption, quiet running."),
    specs: [
      { label: L("Kapacita", "Capacity"), value: "9 kg" },
      { label: L("Technologie", "Technology"), value: "Tepelné čerpadlo, DUAL Inverter" },
      { label: L("Rozměry", "Dimensions"), value: "85 × 60 × 69 cm" },
    ],
    colors: [WHITE],
  },
  {
    slug: "gorenje-nrk6192aw4",
    brand: "Gorenje", category: "velke-spotrebice", name: "Chladnička kombinovaná NRK6192",
    price: 12990, energy: "E", size: "302 l · 185 cm",
    short: L("Kombinovaná chladnička NoFrost Plus s mrazákem dole. Zásuvka CrispZone pro zeleninu a LED osvětlení.", "Fridge-freezer with NoFrost Plus and a bottom freezer. CrispZone drawer for vegetables and LED lighting."),
    specs: [
      { label: L("Objem", "Volume"), value: "204 l chladnička / 98 l mrazák" },
      { label: L("Rozměry", "Dimensions"), value: "185 × 60 × 59,2 cm" },
      { label: L("Hlučnost", "Noise"), value: "38 dB" },
    ],
    colors: [WHITE, INOX],
  },
  {
    slug: "samsung-rb38c7b6as9",
    brand: "Samsung", category: "velke-spotrebice", name: "Chladnička Bespoke RB38C7B6",
    price: 24990, energy: "B", size: "390 l · 203 cm",
    short: L("Bespoke design, technologie SpaceMax a Metal Cooling. Skladem s možností výměny dveřních panelů.", "Bespoke design, SpaceMax and Metal Cooling. In stock with exchangeable door panels."),
    specs: [
      { label: L("Objem", "Volume"), value: "273 l chladnička / 117 l mrazák" },
      { label: L("Rozměry", "Dimensions"), value: "203 × 59,5 × 65,8 cm" },
      { label: L("Hlučnost", "Noise"), value: "35 dB" },
    ],
    colors: [INOX, WHITE, BLACK],
  },
  {
    slug: "beko-bdfn26430x",
    brand: "Beko", category: "velke-spotrebice", name: "Myčka nádobí BDFN26430X",
    price: 9990, energy: "D", size: "14 sad · 60 cm",
    short: L("Volně stojící myčka na 14 sad s programem na 30 minut a třetím košem na příbory.", "Freestanding 14-place dishwasher with a 30-minute programme and a third cutlery tray."),
    specs: [
      { label: L("Kapacita", "Capacity"), value: "14 sad nádobí" },
      { label: L("Programy", "Programmes"), value: "6" },
      { label: L("Hlučnost", "Noise"), value: "44 dB" },
    ],
    colors: [INOX],
  },
  {
    slug: "bosch-smv4hvx00e",
    brand: "Bosch", category: "velke-spotrebice", name: "Vestavná myčka Serie 4 SMV4HVX00E",
    price: 14490, energy: "D", size: "14 sad · 60 cm",
    short: L("Plně vestavná myčka s Home Connect a sušením Extra Dry. Montáž do kuchyňské linky zajistíme.", "Fully integrated dishwasher with Home Connect and Extra Dry. We fit it into your kitchen."),
    specs: [
      { label: L("Kapacita", "Capacity"), value: "14 sad nádobí" },
      { label: L("Hlučnost", "Noise"), value: "46 dB" },
      { label: L("Chytré funkce", "Smart"), value: "Home Connect, Wi-Fi" },
    ],
    colors: [INOX],
  },
  {
    slug: "mora-k-563-aw",
    brand: "Mora", category: "velke-spotrebice", name: "Kombinovaný sporák K 563 AW",
    price: 10990, energy: "A", size: "50 cm",
    short: L("Plynová deska a elektrická trouba s grilem. Padesátka do menších kuchyní, revizi plynu zařídíme.", "Gas hob and electric oven with grill. A 50 cm cooker for smaller kitchens; gas inspection arranged."),
    specs: [
      { label: L("Deska", "Hob"), value: "4 plynové hořáky" },
      { label: L("Trouba", "Oven"), value: "Elektrická, 65 l, gril" },
      { label: L("Rozměry", "Dimensions"), value: "85 × 50 × 60 cm" },
    ],
    colors: [WHITE, INOX],
  },
  {
    slug: "electrolux-eiv63440bs",
    brand: "Electrolux", category: "velke-spotrebice", name: "Indukční deska EIV63440BS",
    price: 11990, energy: "—", size: "60 cm", power: "7,35 kW",
    short: L("Čtyřzónová indukce s propojením zón Bridge a funkcí Hob2Hood. Připojíme včetně revize.", "Four-zone induction with Bridge zone linking and Hob2Hood. Installed including inspection."),
    specs: [
      { label: L("Zóny", "Zones"), value: "4, 2× Bridge" },
      { label: L("Příkon", "Power"), value: "7,35 kW" },
      { label: L("Rozměry", "Dimensions"), value: "59 × 52 cm" },
    ],
    colors: [BLACK],
  },
  {
    slug: "whirlpool-w55zm-111-w",
    brand: "Whirlpool", category: "velke-spotrebice", name: "Mrazák šuplíkový W55ZM 111 W",
    price: 8490, energy: "E", size: "168 l · 142 cm",
    short: L("Šuplíkový mrazák s technologií 6. smysl a rychlým zamrazením. Sedm zásuvek, provoz do garáže.", "Drawer freezer with 6th Sense and fast freeze. Seven drawers, garage-rated."),
    specs: [
      { label: L("Objem", "Volume"), value: "168 l" },
      { label: L("Zásuvky", "Drawers"), value: "7" },
      { label: L("Rozměry", "Dimensions"), value: "142 × 54 × 60 cm" },
    ],
    colors: [WHITE],
  },

  // ───────────────────────── MALÉ SPOTŘEBIČE ─────────────────────────
  {
    slug: "eta-fenix-2233-90000",
    brand: "ETA", category: "male-spotrebice", name: "Tyčový vysavač Fenix 2233",
    price: 4990, energy: "—", power: "25,2 V · 45 min",
    short: L("Bezsáčkový aku vysavač 2v1 s motorizovaným kartáčem a LED osvětlením. Nabíjení v nástěnném držáku.", "Bagless 2-in-1 cordless vacuum with a motorised brush and LED lights. Charges in a wall dock."),
    specs: [
      { label: L("Výdrž", "Runtime"), value: "až 45 min" },
      { label: L("Nádoba", "Bin"), value: "0,6 l" },
      { label: L("Hmotnost", "Weight"), value: "2,6 kg" },
    ],
    colors: [{ hex: "#c9c9c9", name: "Šedá" }, { hex: "#8a1c2f", name: "Vínová" }],
  },
  {
    slug: "rowenta-x-o-rh2037",
    brand: "Rowenta", category: "male-spotrebice", name: "Aku vysavač X-Ō 160 Flex",
    price: 6990, oldPrice: 7990, energy: "—", power: "22,2 V · 60 min", tags: ["sale"],
    short: L("Ohebná trubice pro úklid pod nábytkem, 60 minut chodu a filtrace 99,9 %.", "A flexing wand for cleaning under furniture, 60 minutes of runtime and 99.9 % filtration."),
    specs: [
      { label: L("Výdrž", "Runtime"), value: "až 60 min" },
      { label: L("Filtrace", "Filtration"), value: "99,9 %" },
    ],
    colors: [BLACK],
  },
  {
    slug: "tefal-easy-fry-xxl-ey8018",
    brand: "Tefal", category: "male-spotrebice", name: "Horkovzdušná fritéza Easy Fry XXL",
    price: 3490, energy: "—", power: "1 830 W", size: "6,5 l", tags: ["new"],
    short: L("Fritéza pro celou rodinu s osmi programy a dvěma úrovněmi. Vaření bez oleje, díly do myčky.", "A family-size fryer with eight programmes and two levels. Oil-free cooking, dishwasher-safe parts."),
    specs: [
      { label: L("Objem", "Capacity"), value: "6,5 l" },
      { label: L("Příkon", "Power"), value: "1 830 W" },
      { label: L("Programy", "Programmes"), value: "8" },
    ],
    colors: [BLACK],
  },
  {
    slug: "delonghi-magnifica-start-ecam220-22",
    brand: "De'Longhi", category: "male-spotrebice", name: "Automatický kávovar Magnifica Start",
    price: 9490, energy: "—", power: "1 450 W · 15 bar",
    short: L("Plnoautomat s mlýnkem na zrnkovou kávu a napěňovačem mléka. Čtyři nápoje jedním dotykem.", "Bean-to-cup machine with a grinder and milk frother. Four drinks at one touch."),
    specs: [
      { label: L("Tlak", "Pressure"), value: "15 bar" },
      { label: L("Zásobník vody", "Water tank"), value: "1,8 l" },
      { label: L("Mlýnek", "Grinder"), value: "Kónický, 13 stupňů" },
    ],
    colors: [BLACK, WHITE],
  },
  {
    slug: "philips-series-2200-ep2220",
    brand: "Philips", category: "male-spotrebice", name: "Automatický kávovar Series 2200",
    price: 7490, energy: "—", power: "1 500 W · 15 bar",
    short: L("Keramický mlýnek, AquaClean filtr na 5 000 káv bez odvápnění a klasický napěňovač.", "Ceramic grinder, an AquaClean filter for 5,000 cups without descaling and a classic frother."),
    specs: [
      { label: L("Tlak", "Pressure"), value: "15 bar" },
      { label: L("Zásobník vody", "Water tank"), value: "1,8 l" },
    ],
    colors: [BLACK],
  },
  {
    slug: "bosch-mum-serie-4-mums4eb1",
    brand: "Bosch", category: "male-spotrebice", name: "Kuchyňský robot MUM Serie 4",
    price: 7990, energy: "—", power: "1 000 W", size: "3,9 l",
    short: L("Planetární robot s nerezovou mísou, mixérem a strouhačem. Základ pro pečení i denní vaření.", "Planetary mixer with a stainless bowl, blender and slicer. The base for baking and everyday cooking."),
    specs: [
      { label: L("Příkon", "Power"), value: "1 000 W" },
      { label: L("Mísa", "Bowl"), value: "3,9 l, nerez" },
      { label: L("Příslušenství", "Included"), value: "Mixér, strouhač, hnětací hák, metly" },
    ],
    colors: [BLACK, { hex: "#c8102e", name: "Červená" }],
  },
  {
    slug: "eta-konvice-ela-1598",
    brand: "ETA", category: "male-spotrebice", name: "Rychlovarná konvice Ela 1,7 l",
    price: 899, energy: "—", power: "2 200 W", size: "1,7 l",
    short: L("Nerezová konvice s ukazatelem hladiny a odnímatelným filtrem. Klasika každé prodejny.", "Stainless kettle with a level gauge and removable filter. A staple in every store."),
    specs: [
      { label: L("Objem", "Capacity"), value: "1,7 l" },
      { label: L("Příkon", "Power"), value: "2 200 W" },
    ],
    colors: [INOX, WHITE, BLACK],
  },
  {
    slug: "sencor-smw-5320-mikrovlnna",
    brand: "Sencor", category: "male-spotrebice", name: "Mikrovlnná trouba SMW 5320 s grilem",
    price: 2790, energy: "—", power: "800 W", size: "20 l",
    short: L("Dvacetilitrová mikrovlnka s grilem a osmi automatickými programy. Nerezový vnitřek.", "A 20 litre microwave with grill and eight auto programmes. Stainless interior."),
    specs: [
      { label: L("Objem", "Capacity"), value: "20 l" },
      { label: L("Výkon", "Power"), value: "800 W, gril 1 000 W" },
    ],
    colors: [INOX, BLACK],
  },
  {
    slug: "philips-azur-8000-dst8050",
    brand: "Philips", category: "male-spotrebice", name: "Napařovací žehlička Azur 8000",
    price: 2290, energy: "—", power: "3 000 W",
    short: L("Parní ráz 260 g a žehlicí plocha SteamGlide Elite. Bez nastavování teploty díky OptimalTEMP.", "260 g steam boost and a SteamGlide Elite soleplate. No temperature setting thanks to OptimalTEMP."),
    specs: [
      { label: L("Příkon", "Power"), value: "3 000 W" },
      { label: L("Parní ráz", "Steam boost"), value: "260 g" },
    ],
    colors: [{ hex: "#1f4e79", name: "Modrá" }],
  },
  {
    slug: "braun-series-7-71-n1000s",
    brand: "Braun", category: "male-spotrebice", name: "Holicí strojek Series 7",
    price: 3490, oldPrice: 3990, energy: "—", power: "50 min", tags: ["sale"],
    short: L("Hlava s pohybem do 360° a technologie AutoSense. Wet & Dry, nabíjení za hodinu.", "A 360° flexing head and AutoSense. Wet & Dry, charged in an hour."),
    specs: [
      { label: L("Výdrž", "Runtime"), value: "50 min" },
      { label: L("Použití", "Use"), value: "Wet & Dry" },
    ],
    colors: [{ hex: "#5b6770", name: "Stříbrná" }],
  },

  // ───────────────────────── POČÍTAČE A TELEFONY ─────────────────────────
  {
    slug: "lenovo-ideapad-slim-3-15",
    brand: "Lenovo", category: "pocitace-telefony", name: "IdeaPad Slim 3 15\" Ryzen 5",
    price: 14990, energy: "—", size: "15,6\" FHD", tags: ["new"],
    short: L("Domácí notebook s Ryzenem 5, 16 GB RAM a 512 GB SSD. Windows 11 a Office na přání nastavíme.", "A home laptop with a Ryzen 5, 16 GB RAM and a 512 GB SSD. Windows 11 and Office set up on request."),
    specs: [
      { label: L("Procesor", "Processor"), value: "AMD Ryzen 5 7520U" },
      { label: L("Paměť", "Memory"), value: "16 GB LPDDR5" },
      { label: L("Úložiště", "Storage"), value: "512 GB SSD" },
      { label: L("Displej", "Display"), value: "15,6\" IPS FHD, matný" },
      { label: L("Systém", "OS"), value: "Windows 11 Home" },
    ],
    colors: [{ hex: "#8e9aa6", name: "Arctic Grey" }],
  },
  {
    slug: "hp-250-g10-i5",
    brand: "HP", category: "pocitace-telefony", name: "HP 250 G10 15\" Core i5",
    price: 15490, energy: "—", size: "15,6\" FHD",
    short: L("Pracovní notebook s Core i5, numerickou klávesnicí a Windows 11 Pro. Firmám vystavíme fakturu s DPH.", "A work laptop with a Core i5, numeric keypad and Windows 11 Pro. VAT invoices for businesses."),
    specs: [
      { label: L("Procesor", "Processor"), value: "Intel Core i5-1334U" },
      { label: L("Paměť", "Memory"), value: "16 GB DDR4" },
      { label: L("Úložiště", "Storage"), value: "512 GB SSD" },
      { label: L("Systém", "OS"), value: "Windows 11 Pro" },
    ],
    colors: [{ hex: "#6b7075", name: "Tmavě šedá" }],
  },
  {
    slug: "apple-ipad-11-2025-128gb",
    brand: "Apple", category: "pocitace-telefony", name: "iPad 11\" (A16) 128 GB",
    price: 9990, energy: "—", size: "11\" Liquid Retina",
    short: L("Základní iPad s čipem A16, Touch ID a podporou Apple Pencil. Wi-Fi verze, 128 GB.", "The base iPad with the A16 chip, Touch ID and Apple Pencil support. Wi-Fi model, 128 GB."),
    specs: [
      { label: L("Čip", "Chip"), value: "Apple A16" },
      { label: L("Úložiště", "Storage"), value: "128 GB" },
      { label: L("Displej", "Display"), value: "11\" Liquid Retina" },
    ],
    colors: [{ hex: "#2e5aac", name: "Modrá" }, { hex: "#e8a1b8", name: "Růžová" }, { hex: "#f3e9c8", name: "Žlutá" }, { hex: "#c9ced6", name: "Stříbrná" }],
  },
  {
    slug: "samsung-galaxy-a56-5g-128gb",
    brand: "Samsung", category: "pocitace-telefony", name: "Galaxy A56 5G 128 GB",
    price: 9490, energy: "—", size: "6,7\" AMOLED",
    short: L("Střední třída s 120 Hz displejem, 50 Mpx kamerou a šesti lety aktualizací. Přenos dat ze starého telefonu zdarma.", "Mid-range with a 120 Hz display, 50 MP camera and six years of updates. Free data transfer from your old phone."),
    specs: [
      { label: L("Displej", "Display"), value: "6,7\" Super AMOLED, 120 Hz" },
      { label: L("Paměť", "Memory"), value: "8 GB / 128 GB" },
      { label: L("Baterie", "Battery"), value: "5 000 mAh, 45 W" },
    ],
    colors: [GRAPHITE, { hex: "#c3d5cf", name: "Světle zelená" }, { hex: "#e6d8ef", name: "Levandulová" }],
  },
  {
    slug: "xiaomi-redmi-note-14-128gb",
    brand: "Xiaomi", category: "pocitace-telefony", name: "Redmi Note 14 128 GB",
    price: 4990, oldPrice: 5490, energy: "—", size: "6,67\" AMOLED", tags: ["sale"],
    short: L("Hodně telefonu za málo peněz: AMOLED 120 Hz, 108 Mpx fotoaparát a baterie na dva dny.", "A lot of phone for the money: 120 Hz AMOLED, 108 MP camera and two-day battery."),
    specs: [
      { label: L("Displej", "Display"), value: "6,67\" AMOLED, 120 Hz" },
      { label: L("Paměť", "Memory"), value: "6 GB / 128 GB" },
      { label: L("Baterie", "Battery"), value: "5 500 mAh" },
    ],
    colors: [BLACK, { hex: "#5c7fb5", name: "Modrá" }, { hex: "#7a5f9a", name: "Fialová" }],
  },
  {
    slug: "apple-iphone-16-128gb",
    brand: "Apple", category: "pocitace-telefony", name: "iPhone 16 128 GB",
    price: 21990, energy: "—", size: "6,1\" Super Retina XDR",
    short: L("Čip A18, tlačítko Camera Control a USB-C. Skladem ve všech barvách, ochranné sklo nalepíme na prodejně.", "A18 chip, Camera Control and USB-C. All colours in stock, screen protector fitted in store."),
    specs: [
      { label: L("Čip", "Chip"), value: "Apple A18" },
      { label: L("Úložiště", "Storage"), value: "128 GB" },
      { label: L("Fotoaparát", "Camera"), value: "48 Mpx Fusion + 12 Mpx ultraširoký" },
    ],
    colors: [BLACK, WHITE, { hex: "#e6c5d2", name: "Růžová" }, { hex: "#a9c9d9", name: "Ultramarínová" }, { hex: "#a9c5a2", name: "Modrozelená" }],
  },
  {
    slug: "samsung-monitor-27-s3-fhd",
    brand: "Samsung", category: "pocitace-telefony", name: "Monitor 27\" Essential S3 FHD",
    price: 3990, energy: "E", size: "27\" · 100 Hz",
    short: L("Kancelářský monitor s IPS panelem, 100 Hz a HDMI. Bez rámečku ze tří stran.", "An office monitor with an IPS panel, 100 Hz and HDMI. Bezel-less on three sides."),
    specs: [
      { label: L("Úhlopříčka", "Screen size"), value: "27\" (68 cm)" },
      { label: L("Panel", "Panel"), value: "IPS, 1920 × 1080, 100 Hz" },
      { label: L("Konektory", "Connections"), value: "HDMI, D-Sub" },
    ],
    colors: [BLACK],
  },
  {
    slug: "hp-deskjet-4220e",
    brand: "HP", category: "pocitace-telefony", name: "Tiskárna DeskJet 4220e All-in-One",
    price: 1990, energy: "—",
    short: L("Barevná inkoustová tiskárna se skenerem, Wi-Fi a tiskem z mobilu. Tři měsíce HP Instant Ink v ceně.", "Colour inkjet with scanner, Wi-Fi and mobile printing. Three months of HP Instant Ink included."),
    specs: [
      { label: L("Funkce", "Functions"), value: "Tisk, sken, kopírování" },
      { label: L("Připojení", "Connections"), value: "Wi-Fi, USB, HP Smart" },
    ],
    colors: [WHITE],
  },
  {
    slug: "tp-link-archer-ax55",
    brand: "TP-Link", category: "pocitace-telefony", name: "Wi-Fi 6 router Archer AX55",
    price: 1790, energy: "—",
    short: L("Dvoupásmový Wi-Fi 6 router AX3000 se čtyřmi anténami a gigabitovými porty. Nastavení na prodejně.", "Dual-band AX3000 Wi-Fi 6 router with four antennas and gigabit ports. Configured in store."),
    specs: [
      { label: L("Standard", "Standard"), value: "Wi-Fi 6, AX3000" },
      { label: L("Porty", "Ports"), value: "4× Gigabit LAN, 1× WAN, USB 3.0" },
    ],
    colors: [BLACK],
  },

  // ───────────────────────── NÁŘADÍ ─────────────────────────
  {
    slug: "makita-dhp485rfj",
    brand: "Makita", category: "naradi", name: "Aku příklepová vrtačka DHP485 18V LXT",
    price: 5490, energy: "—", power: "18 V · 50 Nm",
    short: L("Bezuhlíkový příklepový šroubovák se dvěma akumulátory 3,0 Ah a nabíječkou v systaineru Makpac.", "Brushless combi drill with two 3.0 Ah batteries and a charger in a Makpac case."),
    specs: [
      { label: L("Napětí", "Voltage"), value: "18 V LXT" },
      { label: L("Kroutící moment", "Torque"), value: "50 Nm" },
      { label: L("Sklíčidlo", "Chuck"), value: "13 mm" },
      { label: L("Sada", "Kit"), value: "2× 3,0 Ah, nabíječka, Makpac" },
    ],
    colors: [{ hex: MAKITA, name: "Makita" }],
  },
  {
    slug: "makita-dga504z-bruska",
    brand: "Makita", category: "naradi", name: "Aku úhlová bruska DGA504Z 125 mm",
    price: 3290, energy: "—", power: "18 V · 8 500 ot./min",
    short: L("Bezuhlíková aku bruska s brzdou kotouče a ochranou proti zpětnému rázu. Bez akumulátoru.", "Brushless cordless grinder with a disc brake and anti-kickback. Tool only."),
    specs: [
      { label: L("Kotouč", "Disc"), value: "125 mm" },
      { label: L("Otáčky", "Speed"), value: "8 500 ot./min" },
      { label: L("Balení", "Package"), value: "Bez akumulátoru a nabíječky" },
    ],
    colors: [{ hex: MAKITA, name: "Makita" }],
  },
  {
    slug: "bosch-gsb-18v-55-professional",
    brand: "Bosch", category: "naradi", name: "Aku vrtačka GSB 18V-55 Professional",
    price: 5990, energy: "—", power: "18 V · 55 Nm", tags: ["new"],
    short: L("Kompaktní profi příklepovka s bezuhlíkovým motorem, dva akumulátory 2,0 Ah a L-BOXX.", "Compact professional combi with a brushless motor, two 2.0 Ah batteries and an L-BOXX."),
    specs: [
      { label: L("Napětí", "Voltage"), value: "18 V" },
      { label: L("Kroutící moment", "Torque"), value: "55 Nm" },
      { label: L("Sada", "Kit"), value: "2× 2,0 Ah, nabíječka, L-BOXX 136" },
    ],
    colors: [{ hex: BOSCH_BLUE, name: "Bosch Professional" }],
  },
  {
    slug: "bosch-pst-700-e",
    brand: "Bosch", category: "naradi", name: "Přímočará pila PST 700 E",
    price: 1690, energy: "—", power: "500 W",
    short: L("Lehká přímočará pila do dílny s výkyvem, upínáním SDS a CutControl vedením řezu.", "A light home jigsaw with pendulum action, SDS blade change and CutControl."),
    specs: [
      { label: L("Příkon", "Power"), value: "500 W" },
      { label: L("Hloubka řezu", "Cut depth"), value: "70 mm dřevo, 4 mm ocel" },
    ],
    colors: [{ hex: BOSCH_GREEN, name: "Bosch Home" }],
  },
  {
    slug: "narex-evp-13-h-2ca",
    brand: "Narex", category: "naradi", name: "Příklepová vrtačka EVP 13 H-2CA",
    price: 3190, energy: "—", power: "760 W",
    short: L("Dvourychlostní síťová příklepovka z Česka. Robustní kovová převodovka a rychloupínací sklíčidlo.", "Two-speed corded combi drill made in Czechia. Rugged metal gearbox and keyless chuck."),
    specs: [
      { label: L("Příkon", "Power"), value: "760 W" },
      { label: L("Sklíčidlo", "Chuck"), value: "13 mm, rychloupínací" },
      { label: L("Záruka", "Warranty"), value: "3 roky po registraci" },
    ],
    colors: [{ hex: NAREX, name: "Narex" }],
  },
  {
    slug: "narex-ebu-125-13",
    brand: "Narex", category: "naradi", name: "Úhlová bruska EBU 125-13",
    price: 2490, energy: "—", power: "1 300 W",
    short: L("Osvědčená síťová bruska na 125 mm kotouče. Plynulý rozběh a ochrana proti opětovnému spuštění.", "A proven corded grinder for 125 mm discs. Soft start and restart protection."),
    specs: [
      { label: L("Příkon", "Power"), value: "1 300 W" },
      { label: L("Kotouč", "Disc"), value: "125 mm" },
    ],
    colors: [{ hex: NAREX, name: "Narex" }],
  },
  {
    slug: "makita-ls1019l-pokosova",
    brand: "Makita", category: "naradi", name: "Pokosová pila LS1019L 260 mm",
    price: 16990, oldPrice: 18990, energy: "—", power: "1 510 W", tags: ["sale"],
    short: L("Pokosová pila s pojezdem, laserem a řezem do 91 × 310 mm. Vystavena na prodejně Čáslav.", "Sliding mitre saw with laser and cuts up to 91 × 310 mm. On display in the Čáslav store."),
    specs: [
      { label: L("Kotouč", "Blade"), value: "260 mm" },
      { label: L("Max. řez", "Max cut"), value: "91 × 310 mm" },
      { label: L("Příkon", "Power"), value: "1 510 W" },
    ],
    colors: [{ hex: MAKITA, name: "Makita" }],
  },
  {
    slug: "karcher-k-5-premium-smart-control",
    brand: "Kärcher", category: "naradi", name: "Tlaková myčka K 5 Premium Smart Control",
    price: 9990, energy: "—", power: "2 100 W · 145 bar",
    short: L("Vysokotlaká myčka s ovládáním přes aplikaci, hadicovým bubnem a vodou chlazeným motorem.", "Pressure washer with app control, hose reel and a water-cooled motor."),
    specs: [
      { label: L("Tlak", "Pressure"), value: "20–145 bar" },
      { label: L("Průtok", "Flow"), value: "500 l/h" },
      { label: L("Hadice", "Hose"), value: "10 m, buben" },
    ],
    colors: [{ hex: "#f5c400", name: "Kärcher" }],
  },
  {
    slug: "bosch-laser-glm-50-27-cg",
    brand: "Bosch", category: "naradi", name: "Laserový měřič GLM 50-27 CG",
    price: 3990, energy: "—", size: "50 m",
    short: L("Zelený laser s dosahem 50 m, Bluetooth a odolností IP65. Přesnost ±1,5 mm.", "Green laser with a 50 m range, Bluetooth and IP65 rating. ±1.5 mm accuracy."),
    specs: [
      { label: L("Dosah", "Range"), value: "0,05–50 m" },
      { label: L("Přesnost", "Accuracy"), value: "±1,5 mm" },
    ],
    colors: [{ hex: BOSCH_BLUE, name: "Bosch Professional" }],
  },

  // ───────────────────────── ZAHRADA ─────────────────────────
  {
    slug: "vari-sekacka-ctp-4650-lpe",
    brand: "VARI", category: "zahrada", name: "Benzinová sekačka VARI CTP 4650 LPE",
    price: 12990, energy: "—", power: "Loncin 139 ccm", size: "46 cm", tags: ["new"],
    short: L("Sekačka s pojezdem a elektrickým startem, ocelová skříň a 60 l koš. Sestavíme, zajedeme a předáme.", "Self-propelled mower with electric start, steel deck and a 60 l bag. Assembled, run in and handed over."),
    specs: [
      { label: L("Motor", "Engine"), value: "Loncin 139 ccm, elektrický start" },
      { label: L("Šířka záběru", "Cutting width"), value: "46 cm" },
      { label: L("Koš", "Bag"), value: "60 l" },
      { label: L("Pojezd", "Drive"), value: "Ano, 1 rychlost" },
    ],
    colors: [{ hex: VARI, name: "VARI" }],
  },
  {
    slug: "vari-kultivator-global-xl",
    brand: "VARI", category: "zahrada", name: "Kultivátor VARI GLOBAL XL s příslušenstvím",
    price: 24990, energy: "—", power: "Briggs & Stratton 6,5 k", size: "70 cm",
    short: L("Motorový kultivátor z Libice nad Cidlinou s rotavátorem 70 cm. Přídavné nářadí v nabídce, servis u nás.", "A tiller from Libice nad Cidlinou with a 70 cm rotavator. Attachments available, serviced by us."),
    specs: [
      { label: L("Motor", "Engine"), value: "Briggs & Stratton 6,5 k" },
      { label: L("Záběr", "Working width"), value: "70 cm" },
      { label: L("Příslušenství", "Attachments"), value: "Rotavátor, pluh, radlice, vozík (na přání)" },
    ],
    colors: [{ hex: VARI, name: "VARI" }],
  },
  {
    slug: "husqvarna-130-retezova-pila",
    brand: "Husqvarna", category: "zahrada", name: "Řetězová pila Husqvarna 130",
    price: 6490, energy: "—", power: "38 ccm · 1,5 kW", size: "35 cm",
    short: L("Lehká pila na palivové dřevo a práci kolem domu. X-Torq, snadný start a nastavení řetězu bez nářadí.", "A light saw for firewood and work around the house. X-Torq, easy start and tool-free chain tensioning."),
    specs: [
      { label: L("Motor", "Engine"), value: "38 ccm, 1,5 kW" },
      { label: L("Lišta", "Bar"), value: "35 cm" },
      { label: L("Hmotnost", "Weight"), value: "4,7 kg" },
    ],
    colors: [{ hex: HUSQ, name: "Husqvarna" }],
  },
  {
    slug: "husqvarna-automower-305",
    brand: "Husqvarna", category: "zahrada", name: "Robotická sekačka Automower 305",
    price: 24990, energy: "—", size: "do 600 m²",
    short: L("Robot pro menší zahrady do 600 m² se svahem až 40 %. Instalaci vodicího drátu zajistíme.", "A robot for smaller gardens up to 600 m² with slopes to 40 %. Boundary wire installation arranged."),
    specs: [
      { label: L("Plocha", "Area"), value: "do 600 m²" },
      { label: L("Svah", "Slope"), value: "až 40 %" },
      { label: L("Připojení", "Connectivity"), value: "Bluetooth, Automower Connect" },
    ],
    colors: [GRAPHITE],
  },
  {
    slug: "stiga-combi-748-ae-kit",
    brand: "Stiga", category: "zahrada", name: "Aku sekačka Stiga Combi 748 AE Kit",
    price: 14990, energy: "—", power: "48 V · 5 Ah", size: "46 cm",
    short: L("Aku sekačka s pojezdem, sběrem, mulčováním a bočním výhozem. Akumulátor a nabíječka v ceně.", "Cordless self-propelled mower with collection, mulching and side discharge. Battery and charger included."),
    specs: [
      { label: L("Napětí", "Voltage"), value: "48 V" },
      { label: L("Šířka záběru", "Cutting width"), value: "46 cm" },
      { label: L("Sada", "Kit"), value: "1× 5 Ah, nabíječka" },
    ],
    colors: [{ hex: "#ffb400", name: "Stiga" }],
  },
  {
    slug: "gardena-comfortcut-23-18v-p4a",
    brand: "Gardena", category: "zahrada", name: "Aku vyžínač ComfortCut 23/18V P4A",
    price: 3290, energy: "—", power: "18 V", size: "23 cm",
    short: L("Vyžínač na okraje trávníku s baterií 18 V ze systému Power for All. Nastavitelná hlava a kolečko.", "An edge trimmer with an 18 V Power for All battery. Adjustable head and guide wheel."),
    specs: [
      { label: L("Záběr", "Cutting width"), value: "23 cm" },
      { label: L("Systém", "System"), value: "Power for All 18 V" },
    ],
    colors: [{ hex: "#0080c8", name: "Gardena" }],
  },
  {
    slug: "makita-duh523z-plotostrih",
    brand: "Makita", category: "zahrada", name: "Aku plotostřih DUH523Z 52 cm",
    price: 3490, energy: "—", power: "18 V", size: "52 cm",
    short: L("Nůžky na živý plot na baterie Makita 18 V LXT. Lehké tělo 3 kg, lišta 52 cm. Bez akumulátoru.", "A hedge trimmer for Makita 18 V LXT batteries. 3 kg body, 52 cm blade. Tool only."),
    specs: [
      { label: L("Lišta", "Blade"), value: "52 cm" },
      { label: L("Hmotnost", "Weight"), value: "3,0 kg" },
    ],
    colors: [{ hex: MAKITA, name: "Makita" }],
  },
  {
    slug: "hecht-9555-se-snehova-freza",
    brand: "Hecht", category: "zahrada", name: "Sněhová fréza Hecht 9555 SE",
    price: 15990, oldPrice: 17990, energy: "—", power: "212 ccm", size: "56 cm", tags: ["sale"],
    short: L("Dvoustupňová fréza s elektrickým startem, pojezdem a vyhřívanými rukojeťmi. Předsezónní cena.", "Two-stage thrower with electric start, drive and heated grips. Pre-season price."),
    specs: [
      { label: L("Motor", "Engine"), value: "212 ccm, elektrický start" },
      { label: L("Záběr", "Working width"), value: "56 cm" },
      { label: L("Odhoz", "Throw"), value: "až 15 m" },
    ],
    colors: [{ hex: "#c8102e", name: "Hecht" }],
  },
  {
    slug: "gardena-cerpadlo-4100-silent",
    brand: "Gardena", category: "zahrada", name: "Zahradní čerpadlo 4100 Silent",
    price: 4290, energy: "—", power: "550 W · 4 100 l/h",
    short: L("Tiché zahradní čerpadlo pro zavlažování ze sudu nebo studny. Dva výstupy, ochrana proti běhu nasucho.", "A quiet garden pump for watering from a barrel or well. Two outlets, dry-run protection."),
    specs: [
      { label: L("Průtok", "Flow"), value: "4 100 l/h" },
      { label: L("Výtlak", "Head"), value: "45 m" },
    ],
    colors: [{ hex: "#0080c8", name: "Gardena" }],
  },
];

export const bySlug = (slug: string) => products.find((p) => p.slug === slug);
export const byCategory = (c: Category) => products.filter((p) => p.category === c);
export const formatKc = (n: number) =>
  n.toLocaleString("cs-CZ", { maximumFractionDigits: 0 }).replace(/ /g, " ") + " Kč";
