#!/usr/bin/env node
/**
 * Build src/data/catalog.ts and src/data/imageSources.json from the harvested live
 * catalog (harvest/products.json, produced by harvest-catalog.mjs on the harvest-data
 * branch) and the curated selection in scripts/catalog-selection.json.
 *
 *   git fetch origin harvest-data && git show origin/harvest-data:harvest/products.json > harvest/products.json
 *   node scripts/build-catalog.mjs
 *   node scripts/fetch-images.mjs      # downloads the photos listed in imageSources.json
 *
 * The selection supplies what the shop's page cannot: the category of this storefront,
 * the URL slug, the English short description, the headline size / power and colours.
 * Everything else (name, brand, price, energy class, Czech description, specs) is taken
 * from the shop as it is today, so re-running keeps prices and photos current.
 */
import { readFileSync, writeFileSync } from "node:fs";

const HARVEST = process.env.HARVEST ?? "harvest/products.json";
const harvest = JSON.parse(readFileSync(HARVEST, "utf8"));
const selection = JSON.parse(readFileSync("scripts/catalog-selection.json", "utf8"));
const byId = new Map(harvest.products.map((p) => [p.id, p]));

/** Czech spec labels seen on elektrodvorak.cz -> English. Unknown labels keep the Czech text. */
const LABELS = {
  "Typ produktu": "Product type", "Displej": "Display", "Procesor": "Processor", "Paměť": "Memory", "Operační paměť": "Memory", "Úložiště": "Storage", "Fotoaparát": "Camera",
  "Baterie": "Battery", "Operační systém": "Operating system", "Konektivita": "Connectivity", "Rozměry": "Dimensions", "Hmotnost": "Weight", "Barva": "Colour", "Záruka": "Warranty",
  "Úhlopříčka": "Screen size", "Rozlišení": "Resolution", "Výkon": "Power", "Příkon": "Power", "Napětí": "Voltage", "Objem": "Volume", "Kapacita": "Capacity", "Motor": "Engine",
  "Šířka záběru": "Cutting width", "Záběr": "Working width", "Výška": "Height", "Šířka": "Width", "Hloubka": "Depth", "Hlučnost": "Noise", "Energetická třída": "Energy class",
  "Odstřeďování": "Spin speed", "Počet programů": "Programmes", "Programy": "Programmes", "Otáčky": "Speed", "Kotouč": "Disc", "Sklíčidlo": "Chuck", "Lišta": "Bar", "Tlak": "Pressure",
  "Průtok": "Flow", "Výtlak": "Head", "Materiál": "Material", "Zdroj": "Power source", "Napájení": "Power supply", "Obsah balení": "In the box", "Funkce": "Features", "Grafika": "Graphics",
  "Grafická karta": "Graphics", "Pevný disk": "Storage", "Výdrž baterie": "Battery life", "Ovládání": "Controls", "Připojení": "Connections", "Tuner": "Tuner", "Smart TV": "Smart TV",
  "Zvuk": "Sound", "Obnovovací frekvence": "Refresh rate", "HDR": "HDR", "Značka": "Brand", "Model": "Model", "Typ": "Type", "Určení": "Intended use", "Palivo": "Fuel", "Nádrž": "Tank",
  "Obrazové technologie": "Picture technology", "Smart funkce": "Smart features", "Rozhraní": "Connections", "Rozměry se stojanem": "Dimensions with stand", "Typ motoru": "Engine", "Pracovní záběr": "Working width",
  "Převodovka": "Transmission", "Výška sečení": "Cutting height", "Objem sběrného koše": "Collector volume", "Spotřeba energie": "Energy use", "Spotřeba vody": "Water use", "Počet sad nádobí": "Place settings",
  "Tlak čerpadla": "Pump pressure", "Kapacita nádrže na vodu": "Water tank", "Kapacita nádoby na zrna": "Bean hopper", "Kapacita nádoby na mléko": "Milk container", "Typ žehličky": "Iron type", "Žehlicí plocha": "Soleplate",
  "Parní ráz (g/min)": "Steam boost (g/min)", "Variabilní pára až (g/min)": "Steam output (g/min)", "Objem nádržky (na vodu) (ml)": "Water tank (ml)", "Příkon (W)": "Power (W)", "Baterie a nabíjení": "Battery and charging",
  "Typ konstrukce": "Installation", "Šířka spotřebiče": "Width", "Výška spotřebiče": "Height", "Třída energetické účinnosti": "Energy class", "Točivý moment": "Torque", "Počet rychlostí": "Speeds", "Typ baterie": "Battery type",
  "Kapacita baterie": "Battery capacity", "Vrtání (beton)": "Drilling in concrete", "Frekvenční odezva": "Frequency response", "Doba přehrávání": "Playtime", "Odolnost": "Protection", "Brusný kotouč (Ø)": "Disc diameter",
  "Velikost vřetene": "Spindle", "Jmenovitý příkon": "Rated power", "Volnoběžné otáčky": "No-load speed", "Výstupní výkon": "Output power", "Průměr kotouče": "Disc diameter", "Délka lišty": "Bar length", "Šíře střihu": "Cutting capacity",
  "Otočná rukojeť": "Rotating handle", "Napětí akumulátoru": "Battery voltage", "Kapacita akumulátoru v sadě": "Battery in the set", "Otáčky bez zatížení": "No-load speed", "Hlavní": "Main camera", "Tele objektiv": "Telephoto",
  "Přední": "Front camera", "Rychlost nabíjení": "Charging speed", "Reverzní drátové nabíjení": "Reverse wired charging", "Chipset": "Chipset", "Mobilní sítě": "Mobile networks", "Rozlišení displeje": "Display resolution",
  "Displej (úhlopříčka)": "Display", "Objem hlavní nádoby": "Bowl volume", "Počet rychlostních stupňů": "Speed settings", "Planetární systém míchání": "Planetary mixing", "Pulzní spínač": "Pulse", "Plynulá regulace rychlosti": "Variable speed",
  "Herní režimy": "Game modes", "Herní stav": "Game features", "Nastavení": "Settings", "CPU": "CPU", "GPU": "GPU", "ROM": "Storage", "RAM": "RAM", "Video": "Video formats", "Audio": "Audio formats", "Vysoký výkon": "High power",
  "Variabilní pojezd": "Variable drive", "Rychlé zprovoznění": "Fast charging", "Praktické skladování": "Storage", "Efektivní výkon": "Performance", "Ergonomické ovládání": "Ergonomics", "4 funkce": "4 functions", "2 v 1": "2-in-1",
  "Praktický a snadno skladovatelný": "Practical and easy to store", "Moderní a elegantní design": "Modern design", "4 režimy úklidu": "4 cleaning modes", "2 režimy holení": "2 shaving modes", "Rozměry (DxŠxV)": "Dimensions",
  "Závit hřídele brusky": "Spindle thread", "O hrncového kartáče": "Cup brush diameter", "Počet rychlostí pojezdu": "Drive speeds", "Plošný výkon stroje": "Area per hour", "15 pracích programů": "15 programmes", "8 pracích teplot": "8 temperatures",
  "Plnění": "Loading", "příslušenství": "Included", "rozměry spotřebiče (v x š x h)": "Dimensions (H × W × D)", "jmenovitý příkon": "Rated power", "elektrické napětí": "Voltage", "VxSˇxH": "H × W × D", "Spotřeba el. energie": "Energy use",
  "Typ zařízení": "Device type", "Dostupné funkce": "Functions",
};
const T = (cs, en) => ({ cs, en });
/** The shop stores descriptions with named HTML entities for Czech letters. */
const ENT = { yacute: "ý", iacute: "í", aacute: "á", eacute: "é", uacute: "ú", oacute: "ó", scaron: "š", Scaron: "Š", ccaron: "č", Ccaron: "Č", rcaron: "ř", Rcaron: "Ř", zcaron: "ž", Zcaron: "Ž", ecaron: "ě", Ecaron: "Ě", uring: "ů", Uring: "Ů", nacute: "ň", tcaron: "ť", dcaron: "ď", Uacute: "Ú", Yacute: "Ý", Aacute: "Á", Iacute: "Í", Eacute: "É", Oacute: "Ó", ndash: "–", mdash: "—", deg: "°", bull: "•", hellip: "…", quot: "\"", amp: "&", lt: "<", gt: ">", nbsp: " ", Oslash: "Ø", oslash: "ø", times: "×", laquo: "«", raquo: "»", ldquo: "“", rdquo: "”", bdquo: "„", rsquo: "’", lsquo: "‘", trade: "™", reg: "®", copy: "©", micro: "µ", sup2: "²", sup3: "³", frac12: "½" };
const dec = (t) => String(t ?? "").replace(/&([a-zA-Z]+\d*);/g, (m, n) => ENT[n] ?? m).replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/\s+/g, " ").trim();
const JUNK_SPEC = /^(e-mail|tel\.?|art\. number|ean|kód|kwh\/annum|min\/cycle|db|cena|dostupnost|jazyk ovládacího panelu)$/i;
const q = (s) => JSON.stringify(String(s ?? ""));
/** First sentence(s) of the shop's description, cut at a sentence or bullet boundary, ~180 chars. */
const shortCs = (p) => {
  const t = dec(p.short || p.description || p.title).replace(/\s*•\s*/g, " · ").trim();
  if (t.length <= 190) return t;
  const cut = t.slice(0, 190);
  const at = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(" · "), cut.lastIndexOf(", "));
  return (at > 80 ? cut.slice(0, at) : cut).replace(/[ ,·.]+$/, "") + (at > 80 && cut[at] === "." ? "." : "…");
};
/** Shop titles carry the brand and generic nouns; keep the model and a short type word. */
const cleanName = (p, sel) => {
  if (sel.name) return sel.name;
  let n = dec(p.title).replace(/\(vystavený model\)/i, "").replace(/\s+/g, " ").trim();
  const b = p.brand.toLowerCase();
  if (n.toLowerCase().startsWith(b + " ")) n = n.slice(b.length + 1);
  n = n.replace(/^(ntb|televizor|televize|espresso|vysavač|žehlička|fén|robot|pračka|sporák|myčka|mraznička|trouba|odsavač|tiskárna|router|sekačka|pila|čerpadlo|kombinovaná chladnička)\s+/i, "");
  return n.replace(/\s*[-–]\s*(Notebook|Laptop).*$/i, "").replace(/\s+(Notebook|Laptop|Telefon|Mobilní telefon|Tiskárna|Televize|Televizor)(,\s*Laptop)?$/i, "").trim();
};

const out = [];
const sources = {};
const missing = [];
for (const sel of selection) {
  const p = byId.get(String(sel.id));
  if (!p) { missing.push(sel.id); continue; }
  if (p.image) sources[sel.slug] = { url: p.image, page: p.url };
  const specs = [];
  for (const [k0, v0] of p.specs ?? []) {
    const k = dec(k0).replace(/:$/, ""), v = dec(v0);
    if (specs.length >= 8) break;
    if (JUNK_SPEC.test(k) || v.length > 90 || k.length > 40 || !v) continue;
    specs.push({ label: T(k, LABELS[k] ?? sel.labels?.[k] ?? k), value: v });
  }
  for (const s of sel.specs ?? []) specs.push({ label: T(s[0], s[1]), value: s[2] });
  const tags = [...(sel.tags ?? [])];
  if ((p.oldPrice && p.oldPrice > p.price) || p.labels?.some((l) => /cena|akce|sleva/i.test(l))) if (!tags.includes("sale")) tags.push("sale");
  out.push({
    slug: sel.slug, brand: sel.brand ?? p.brand, category: sel.category, name: cleanName(p, sel), price: p.price ?? sel.price ?? 0, oldPrice: p.oldPrice && p.oldPrice > p.price ? p.oldPrice : undefined,
    energy: sel.energy ?? p.energy ?? "—", tags, power: sel.power, size: sel.size,
    short: T(sel.shortCs ?? shortCs(p), sel.short), specs, colors: sel.colors ?? ["#1f1f1f"], source: p.url,
  });
}
if (missing.length) console.warn(`not in harvest: ${missing.join(", ")}`);

const header = readFileSync("scripts/catalog-header.ts", "utf8");
const entries = out.map((p) => {
  const lines = [
    `  {`,
    `    slug: ${q(p.slug)},`,
    `    brand: ${q(p.brand)}, category: ${q(p.category)}, name: ${q(p.name)},`,
    `    price: ${p.price}${p.oldPrice ? `, oldPrice: ${p.oldPrice}` : ""}, energy: ${q(p.energy)}${p.size ? `, size: ${q(p.size)}` : ""}${p.power ? `, power: ${q(p.power)}` : ""}${p.tags.length ? `, tags: ${JSON.stringify(p.tags)}` : ""},`,
    `    short: L(${q(p.short.cs)}, ${q(p.short.en)}),`,
    `    specs: [`,
    ...p.specs.map((s) => `      { label: L(${q(s.label.cs)}, ${q(s.label.en)}), value: ${q(s.value)} },`),
    `    ],`,
    `    colors: ${JSON.stringify(p.colors)},`,
    `    source: ${q(p.source)},`,
    `  },`,
  ];
  return lines.join("\n");
});
const byCat = {};
for (const p of out) (byCat[p.category] ??= []).push(p);
let body = "export const products: Product[] = [\n";
for (const [cat, list] of Object.entries(byCat)) {
  body += `  // ───────────────────────── ${cat.toUpperCase()} ─────────────────────────\n`;
  body += list.map((p) => entries[out.indexOf(p)]).join("\n") + "\n";
}
body += "];\n";
const footer = `
export const bySlug = (slug: string) => products.find((p) => p.slug === slug);
export const byCategory = (c: Category) => products.filter((p) => p.category === c);
export const formatKc = (n: number) =>
  n.toLocaleString("cs-CZ", { maximumFractionDigits: 0 }).replace(/ /g, " ") + " Kč";
`;
writeFileSync("src/data/catalog.ts", `${header}\n// ── Generated by scripts/build-catalog.mjs from elektrodvorak.cz (harvest ${harvest.harvestedAt}). Edit scripts/catalog-selection.json, not this list. ──\n${body}${footer}`);
writeFileSync("src/data/imageSources.json", JSON.stringify(sources, null, 2) + "\n");
console.log(`wrote src/data/catalog.ts (${out.length} products) and src/data/imageSources.json (${Object.keys(sources).length} photos)`);
