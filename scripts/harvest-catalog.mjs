#!/usr/bin/env node
/**
 * Harvest the live elektrodvorak.cz catalog into harvest/products.json so the mockup
 * catalog can be rebuilt from products the shop really sells (names, prices, photos,
 * specs). Nothing is downloaded except HTML; photos come later via fetch-images.mjs.
 *
 *   MAX_PAGES=8000 node scripts/harvest-catalog.mjs
 *
 * Runs on GitHub Actions (.github/workflows/harvest-catalog.yml), which commits the
 * JSON to the `harvest-data` branch. Extraction is deliberately defensive: JSON-LD
 * first (Product, BreadcrumbList), then microdata and meta tags, then plain regexes.
 */
import { mkdir, writeFile } from "node:fs/promises";

const ROOT = "https://www.elektrodvorak.cz";
const MAX_PAGES = Number(process.env.MAX_PAGES ?? 8000);
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 8);
const OUT = "harvest/products.json";
const UA = { "user-agent": "Mozilla/5.0 (compatible; elektrodvorak-mockup-harvest/1.0; +https://github.com/bilguun17481/WEB-DEV-part-2)" };

const html = async (url) => {
  const r = await fetch(url, { headers: UA, redirect: "follow" });
  if (!r.ok) throw new Error(`${r.status}`);
  if (!(r.headers.get("content-type") ?? "").includes("html")) throw new Error("not html");
  return r.text();
};
const decode = (s) => String(s ?? "").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'").replace(/&nbsp;|&#160;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/\s+/g, " ").trim();
const strip = (s) => decode(String(s ?? "").replace(/<[^>]+>/g, " "));
const isProduct = (p) => /\/pro\d+\.html$/.test(p);
const isCategory = (p) => /\/kat\d+\.html$/.test(p);
const skip = /\.(jpe?g|png|gif|webp|svg|pdf|xml|css|js|ico|zip|webmanifest)$|\/(kosik|cart|login|prihlaseni|registrace|ucet|account|porovnani|compare|oblibene|wishlist|hodnoceni|diskuze|rss|assets)\b/i;
const okQuery = (q) => !q || /^\?(page|strana|str|p)=\d+$/i.test(q);

// ── crawl ──────────────────────────────────────────────────────────────────────
const seen = new Set([ROOT + "/"]);
const queue = [{ url: ROOT + "/", from: null }];
const products = [];
const categories = new Map(); // url -> { title, parent }
let visited = 0, inFlight = 0;
await new Promise((done) => {
  const pump = () => {
    while (inFlight < CONCURRENCY && queue.length && visited + inFlight < MAX_PAGES) {
      const { url, from } = queue.shift(); inFlight++;
      html(url).then((body) => {
        visited++;
        const path = new URL(url).pathname;
        if (isProduct(path)) products.push(extractProduct(url, body, from));
        else if (isCategory(path) || path === "/") categories.set(url, { title: strip(body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? body.match(/<title>([^<]*)<\/title>/i)?.[1] ?? ""), parent: from });
        // Product pages link to thousands of siblings; only follow links from listing pages to keep the crawl focused.
        if (!isProduct(path)) {
          for (const m of body.matchAll(/href="((?:https?:\/\/(?:www\.)?elektrodvorak\.cz)?\/[^"#]*)"/g)) {
            const abs = m[1].startsWith("http") ? m[1].replace("://elektrodvorak.cz", "://www.elektrodvorak.cz") : ROOT + m[1];
            let u; try { u = new URL(decode(abs)); } catch { continue; }
            if (u.host !== "www.elektrodvorak.cz" || skip.test(u.pathname) || !okQuery(u.search)) continue;
            if (!isProduct(u.pathname) && !isCategory(u.pathname) && !/^\/[a-z0-9-]+\/?$/.test(u.pathname)) continue;
            const key = u.origin + u.pathname + u.search;
            if (!seen.has(key)) { seen.add(key); queue.push({ url: key, from: isCategory(path) || path === "/" ? url : from }); }
          }
        }
        if (visited % 250 === 0) console.log(`  … ${visited} pages, ${products.length} products, ${queue.length} queued`);
      }).catch((e) => console.warn("skip", url, e.message)).finally(() => { inFlight--; if ((!queue.length || visited >= MAX_PAGES) && !inFlight) done(); else pump(); });
    }
    if (!queue.length && !inFlight) done();
  };
  pump();
});
console.log(`visited ${visited} pages: ${products.length} products, ${categories.size} listing pages`);

// ── extraction ─────────────────────────────────────────────────────────────────
function jsonLd(body) {
  const out = [];
  for (const m of body.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { const j = JSON.parse(m[1].trim()); (Array.isArray(j) ? j : j["@graph"] ? j["@graph"] : [j]).forEach((x) => out.push(x)); } catch {}
  }
  return out;
}
function extractProduct(url, body, from) {
  // Markup of elektrodvorak.cz (September 2026): h1.h1 title, p.number product code, .product-img gallery with
  // data-lightbox links to full-size photos under /produkty/<id>/, ul.ul-price-new price, ul.ul-availability,
  // ul.ul-producer brand, #popis-produktu .popis_rozsireny description, table.table-product misc rows.
  const ld = jsonLd(body);
  const crumbs = ld.find((x) => /BreadcrumbList/i.test(String(x["@type"])))?.itemListElement?.map((e) => strip(e.name ?? e.item?.name ?? "")).filter(Boolean) ?? [];
  if (!crumbs.length) {
    const nav = body.match(/<(?:ol|ul|nav|div)[^>]*(?:breadcrumb|drobeck)[^>]*>([\s\S]*?)<\/(?:ol|ul|nav|div)>/i)?.[1];
    if (nav) for (const m of nav.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)) { const t = strip(m[1]); if (t) crumbs.push(t); }
  }
  const h1At = body.search(/<h1[^>]*>/i);
  const main = h1At >= 0 ? body.slice(h1At) : body;               // everything from the title down
  const related = main.search(/Mohlo by se v[áa]m tak[ée] l[íi]bit|podobn[ée] produkty/i);
  const own = related > 0 ? main.slice(0, related) : main;         // product's own block, before "you may also like"
  const title = strip(own.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
  const sku = strip(own.match(/class="number">\s*K[óo]d produktu:?\s*([^<]+)</i)?.[1] ?? "");
  const gallery = own.match(/<div class="product-img">([\s\S]*?)<div class="col-sm-30">/i)?.[1] ?? own.slice(0, 40000);
  const images = [...new Set([...gallery.matchAll(/href="(https?:\/\/[^"]*\/produkty\/\d+\/\d+\.(?:jpe?g|png|webp))"/gi)].map((m) => decode(m[1])))];
  if (!images.length) for (const m of gallery.matchAll(/src="(https?:\/\/[^"]*\/produkty\/\d+\/(?:middle-|small-)?\d+\.(?:jpe?g|png|webp))"/gi)) images.push(decode(m[1]).replace(/\/(middle|small)-/, "/"));
  const money = (t) => { const n = Number(decode(t).replace(/[^\d,]/g, "").replace(",", ".")); return Number.isFinite(n) && n > 0 ? Math.round(n) : null; };
  const price = money(own.match(/class="ul-price-new">([\s\S]*?)<\/li>/i)?.[1] ?? "");
  const oldPrice = money(own.match(/class="ul-price-old">([\s\S]*?)<\/li>/i)?.[1] ?? "");
  const labels = [...own.matchAll(/<li class="ul-labels-[a-z]+">([^<]*)<\/li>/gi)].map((m) => strip(m[1]));
  const availability = [...(own.match(/ul-availability">([\s\S]*?)<\/ul>/i)?.[1] ?? "").matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((m) => strip(m[1]));
  const brand = strip(own.match(/ul-producer"><li><a[^>]*>([^<]*)<\/a>/i)?.[1] ?? "") || title.split(" ")[0];
  const popis = body.match(/<div class="popis_rozsireny">([\s\S]*?)<div class="popis_rozsireny_btn">/i)?.[1] ?? body.match(/<div class="popis_rozsireny">([\s\S]*?)<\/div>\s*<\/div>/i)?.[1] ?? "";
  const paragraphs = [...popis.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => strip(m[1])).filter((t) => t && t !== " ");
  const bullets = [...popis.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => strip(m[1])).filter(Boolean);
  // "Key: value" bullets (technical specification lists) become specs; the rest stay as selling points.
  const specs = []; const points = [];
  for (const b of bullets) { const m = b.match(/^([^:]{2,40}):\s*(.{1,120})$/); if (m) specs.push([m[1].trim(), m[2].trim()]); else points.push(b); }
  for (const m of own.matchAll(/<tr>\s*<td>([^<]*)<\/td>\s*<td>([^<]*)<\/td>\s*<\/tr>/gi)) { const k = strip(m[1]).replace(/:$/, ""), v = strip(m[2]); if (k && v && !/k[óo]d produktu|v[ýy]robce/i.test(k)) specs.push([k, v]); }
  const text = paragraphs.join(" ");
  const energy = (text + " " + bullets.join(" ")).match(/energetick[áé]\s+t[řr][íi]d[aěy]\s*:?\s*([A-G])\b(?!\+)/i)?.[1]?.toUpperCase() ?? null;
  return {
    url, id: url.match(/pro(\d+)\.html/)?.[1] ?? null, title, brand, sku, price, oldPrice, labels, availability, energy,
    image: images[0] ?? null, images, short: paragraphs[0]?.slice(0, 400) ?? "", description: text.slice(0, 2500), points: points.slice(0, 12), specs: specs.slice(0, 20),
    crumbs, from,
  };
}

// ── write ──────────────────────────────────────────────────────────────────────
await mkdir("harvest", { recursive: true });
const cats = [...categories.entries()].map(([url, c]) => ({ url, ...c }));
await writeFile(OUT, JSON.stringify({ harvestedAt: new Date().toISOString(), visited, categories: cats, products }, null, 1));
const n = (f) => products.filter(f).length;
console.log(`wrote ${OUT}: ${products.length} products (${n((p) => p.image)} with image, ${n((p) => p.price)} with price, ${n((p) => p.crumbs.length)} with breadcrumbs, ${n((p) => p.short)} with description, ${n((p) => p.energy)} with energy class)`);
