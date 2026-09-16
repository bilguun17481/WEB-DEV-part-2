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
  const ld = jsonLd(body);
  const prod = ld.find((x) => /Product/i.test(String(x["@type"])));
  const crumbs = ld.find((x) => /BreadcrumbList/i.test(String(x["@type"])))?.itemListElement?.map((e) => strip(e.name ?? e.item?.name ?? "")).filter(Boolean) ?? [];
  if (!crumbs.length) {
    const nav = body.match(/<(?:ol|ul|nav|div)[^>]*(?:breadcrumb|drobeck)[^>]*>([\s\S]*?)<\/(?:ol|ul|nav|div)>/i)?.[1];
    if (nav) for (const m of nav.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)) { const t = strip(m[1]); if (t) crumbs.push(t); }
  }
  const h1 = strip(body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
  const title = h1 || strip(prod?.name) || decode(body.match(/property="og:title"\s+content="([^"]+)"/i)?.[1] ?? "");
  const image = prod?.image ? (Array.isArray(prod.image) ? prod.image[0] : typeof prod.image === "object" ? prod.image.url : prod.image) : body.match(/property="og:image"\s+content="([^"]+)"/i)?.[1];
  const offers = prod?.offers ? (Array.isArray(prod.offers) ? prod.offers[0] : prod.offers) : null;
  const priceText = offers?.price ?? body.match(/itemprop="price"[^>]*content="([\d.,]+)"/i)?.[1] ?? body.match(/(\d{1,3}(?:[  ]\d{3})*(?:,\d+)?)\s*Kč/)?.[1];
  const price = priceText ? Math.round(Number(String(priceText).replace(/[  ]/g, "").replace(",", "."))) : null;
  const brand = strip(typeof prod?.brand === "object" ? prod.brand?.name : prod?.brand) || strip(body.match(/(?:Výrobce|Značka)[^<]*<\/(?:th|dt|span|strong|td)>\s*<(?:td|dd|span|a)[^>]*>([\s\S]*?)<\//i)?.[1] ?? "") || title.split(" ")[0];
  const description = strip(prod?.description) || decode(body.match(/name="description"\s+content="([^"]*)"/i)?.[1] ?? "") || decode(body.match(/property="og:description"\s+content="([^"]*)"/i)?.[1] ?? "");
  const availability = strip(offers?.availability ?? "").replace(/.*\//, "") || (/skladem/i.test(body) ? "InStock" : "");
  const sku = strip(prod?.sku ?? prod?.mpn ?? body.match(/(?:Kód|Katalogové číslo|EAN)[^<]*<\/(?:th|dt|span|strong|td)>\s*<(?:td|dd|span)[^>]*>([\s\S]*?)<\//i)?.[1] ?? "");
  // Specs: table rows or dt/dd pairs; keep short, textual pairs only.
  const specs = [];
  for (const m of body.matchAll(/<tr[^>]*>\s*<t[hd][^>]*>([\s\S]*?)<\/t[hd]>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi)) {
    const k = strip(m[1]), v = strip(m[2]);
    if (k && v && k.length <= 40 && v.length <= 80 && !/cena|kč|dostupnost|kód|ean/i.test(k)) specs.push([k.replace(/:$/, ""), v]);
    if (specs.length >= 14) break;
  }
  if (specs.length < 3) for (const m of body.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi)) {
    const k = strip(m[1]), v = strip(m[2]);
    if (k && v && k.length <= 40 && v.length <= 80) specs.push([k.replace(/:$/, ""), v]);
    if (specs.length >= 14) break;
  }
  const energy = body.match(/(?:energetick[áé] t[řr][íi]d[ay]|Energy class)[^A-G]{0,40}\b([A-G])\b(?![+])/i)?.[1] ?? specs.find(([k]) => /energetick/i.test(k))?.[1]?.match(/\b([A-G])\b/)?.[1] ?? null;
  const oldPriceText = body.match(/(?:Původní cena|Běžná cena|před slevou)[^\d]{0,60}(\d{1,3}(?:[  ]\d{3})*)\s*Kč/i)?.[1];
  return {
    url, title, brand, price, oldPrice: oldPriceText ? Number(oldPriceText.replace(/[  ]/g, "")) : null, sku, energy,
    image: image ? new URL(decode(image), url).href : null, description: description.slice(0, 600), availability, crumbs, specs, from,
  };
}

// ── write ──────────────────────────────────────────────────────────────────────
await mkdir("harvest", { recursive: true });
const cats = [...categories.entries()].map(([url, c]) => ({ url, ...c }));
await writeFile(OUT, JSON.stringify({ harvestedAt: new Date().toISOString(), visited, categories: cats, products }, null, 1));
const withImg = products.filter((p) => p.image).length, withPrice = products.filter((p) => p.price).length, withCrumbs = products.filter((p) => p.crumbs.length).length;
console.log(`wrote ${OUT}: ${products.length} products (${withImg} with image, ${withPrice} with price, ${withCrumbs} with breadcrumbs)`);
