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
};
const T = (cs, en) => ({ cs, en });
const q = (s) => JSON.stringify(String(s ?? ""));
/** First sentence(s) of the shop's description, cut at a sentence or bullet boundary, ~180 chars. */
const shortCs = (p) => {
  const t = (p.short || p.description || p.title).replace(/\s*•\s*/g, " · ").trim();
  if (t.length <= 190) return t;
  const cut = t.slice(0, 190);
  const at = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(" · "), cut.lastIndexOf(", "));
  return (at > 80 ? cut.slice(0, at) : cut).replace(/[ ,·.]+$/, "") + (at > 80 && cut[at] === "." ? "." : "…");
};
/** Shop titles carry the brand and generic nouns; keep the model and a short type word. */
const cleanName = (p, sel) => {
  if (sel.name) return sel.name;
  let n = p.title.replace(/\(vystavený model\)/i, "").replace(/\s+/g, " ").trim();
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
  for (const [k, v] of p.specs ?? []) { if (specs.length >= 8) break; if (/^(Kód|EAN|Cena|Dostupnost)/i.test(k)) continue; specs.push({ label: T(k, LABELS[k] ?? sel.labels?.[k] ?? k), value: v }); }
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
