#!/usr/bin/env node
/**
 * Crawl elektrodvorak.cz, download each product page's main image into
 * public/products/<catalog-slug>.<ext>, and write src/data/images.json
 * (catalog slug -> public path).
 *
 * Matching, in order: the model code embedded in the catalog slug (e.g. `wgg244a0by`
 * from `bosch-wgg244a0by`) found in a page title, then any digit-bearing slug token
 * (`ey8018`), then a plain word-overlap score. Add manual pairs to OVERRIDES when a
 * product still slips through.
 *
 *   node scripts/fetch-images.mjs            # crawl + download + write manifest
 *   node scripts/fetch-images.mjs --dry-run  # only print the match report
 *
 * Needs Node 18+ and network access to elektrodvorak.cz and its image CDN.
 * The shop has thousands of pages, so the crawl is capped (MAX_PAGES, default 4000)
 * and runs CONCURRENCY requests at a time. `.github/workflows/fetch-images.yml`
 * runs this on GitHub Actions and commits the result.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "https://www.elektrodvorak.cz";
const OUT_DIR = "public/products";
const MANIFEST = "src/data/images.json";
const DRY = process.argv.includes("--dry-run");
const MAX_PAGES = Number(process.env.MAX_PAGES ?? 4000);
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 6);

/** Catalog slug -> exact elektrodvorak.cz path, when matching is not enough. */
const OVERRIDES = {
  // "lg-oled65b4": "/lg-oled65b4/prod12345.html",
};

const catalog = await loadCatalog();
const UA = { "user-agent": "Mozilla/5.0 (compatible; elektrodvorak-mockup-fetch/1.0; +https://github.com/bilguun17481/WEB-DEV-part-2)" };
const html = async (url) => {
  const r = await fetch(url, { headers: UA, redirect: "follow" });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  if (!(r.headers.get("content-type") ?? "").includes("html")) throw new Error(`not html ${url}`);
  return r.text();
};

// 1. Crawl internal pages, breadth-first, same host, capped.
const skip = /\.(jpe?g|png|gif|webp|svg|pdf|xml|css|js|ico|zip)$|\/(kosik|cart|login|prihlaseni|registrace|ucet|account|porovnani|compare|oblibene|wishlist|hodnoceni|diskuze|rss)\b/i;
const okQuery = (q) => !q || /^\?(page|strana|str|p)=\d+$/i.test(q);
const seen = new Set([ROOT + "/"]);
const queue = [ROOT + "/"];
const pages = [];
let inFlight = 0;
await new Promise((done) => {
  const pump = () => {
    while (inFlight < CONCURRENCY && queue.length && pages.length + inFlight < MAX_PAGES) {
      const url = queue.shift(); inFlight++;
      html(url).then((body) => {
        pages.push({ url, body });
        for (const m of body.matchAll(/href="((?:https?:\/\/(?:www\.)?elektrodvorak\.cz)?\/[^"#]*)"/g)) {
          const abs = m[1].startsWith("http") ? m[1].replace("://elektrodvorak.cz", "://www.elektrodvorak.cz") : ROOT + m[1];
          let u; try { u = new URL(abs); } catch { continue; }
          if (u.host !== "www.elektrodvorak.cz" || skip.test(u.pathname) || !okQuery(u.search)) continue;
          const key = u.origin + u.pathname + u.search;
          if (!seen.has(key)) { seen.add(key); queue.push(key); }
        }
        if (pages.length % 250 === 0) console.log(`  … ${pages.length} pages, ${queue.length} queued`);
      }).catch((e) => console.warn("skip", url, e.message)).finally(() => { inFlight--; if (!queue.length && !inFlight || pages.length >= MAX_PAGES && !inFlight) done(); else pump(); });
    }
    if (!queue.length && !inFlight) done();
  };
  pump();
});
console.log(`crawled ${pages.length} pages`);

// 2. For each page: title + best image candidate.
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const candidates = pages.map(({ url, body }) => {
  const h1 = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const ogTitle = body.match(/property="og:title"\s+content="([^"]+)"/i)?.[1];
  const title = decode((h1 ?? ogTitle ?? body.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "").replace(/<[^>]+>/g, "")).replace(/\s*[|·–-]\s*Elektro\s*Dvořák.*$/i, "").trim();
  const og = body.match(/property="og:image"\s+content="([^"]+)"/i)?.[1];
  const imgs = [...body.matchAll(/<img[^>]+(?:data-src|src)="([^"]+)"/gi)].map((m) => m[1])
    .filter((s) => /\.(png|jpe?g|webp)(\?|$)/i.test(s) && !/logo|icon|flag|banner|bg_|pattern|heureka|zbozi|payment|dopravce|platba|sprite|blank|pixel/i.test(s));
  const image = og ?? imgs[0];
  const isProduct = /prod\d+\.html|\/produkt|itemprop="price"|class="[^"]*(?:product-detail|detail-product|product__detail)/i.test(url + body.slice(0, 200000));
  return { url, title, image: image ? new URL(decode(image), url).href : undefined, isProduct };
}).filter((c) => c.title && c.image);
console.log(`${candidates.length} pages with a title and image (${candidates.filter((c) => c.isProduct).length} look like product pages)`);

// 3. Match catalog products to pages.
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const squash = (s) => norm(s).replace(/ /g, "");
const tokens = (s) => new Set(norm(s).split(" ").filter(Boolean));
const score = (a, b) => { const ta = tokens(a), tb = tokens(b); let n = 0; for (const t of ta) if (tb.has(t)) n++; return n / Math.max(ta.size, 1); };
/** Model code from the slug: everything after the brand prefix, hyphens removed (`bosch-wgg244a0by` -> `wgg244a0by`). */
const modelCode = (p) => { const b = squash(p.brand); const s = p.slug.replace(/-/g, ""); return s.startsWith(b) ? s.slice(b.length) : s; };
const digitTokens = (p) => p.slug.split("-").filter((t) => /\d/.test(t) && t.length >= 4 && !/^\d+(gb|tb|mm|cm|l|w|v|k)?$/.test(t));

const manifest = {};
const report = [];
const byQuality = (a, b) => Number(b.isProduct) - Number(a.isProduct);
for (const p of catalog) {
  let page = OVERRIDES[p.slug] ? candidates.find((c) => c.url === ROOT + OVERRIDES[p.slug]) : undefined;
  let how = "override";
  if (!page) {
    const code = modelCode(p);
    const hits = code.length >= 5 ? candidates.filter((c) => squash(c.title).includes(code)).sort(byQuality) : [];
    if (hits.length) { page = hits[0]; how = `model ${code}`; }
  }
  if (!page) {
    for (const t of digitTokens(p)) {
      const hits = candidates.filter((c) => squash(c.title).includes(t) && squash(c.title).includes(squash(p.brand))).sort(byQuality);
      if (hits.length) { page = hits[0]; how = `token ${t}`; break; }
    }
  }
  if (!page) {
    // Word overlap alone picked wrong products (any "sušička s tepelným čerpadlem" scored high), so require the brand too.
    const sameBrand = candidates.filter((c) => squash(c.title).includes(squash(p.brand)));
    const ranked = sameBrand.map((c) => ({ c, s: score(p.name, c.title) })).sort((x, y) => y.s - x.s);
    if (ranked[0] && ranked[0].s >= 0.75) { page = ranked[0].c; how = `words ${ranked[0].s.toFixed(2)}`; }
  }
  if (!page) { report.push(`  ✗ ${p.slug}  (no page matched "${p.brand} ${p.name}")`); continue; }
  const ext = (page.image.match(/\.(png|jpe?g|webp)/i)?.[1] ?? "jpg").toLowerCase().replace("jpeg", "jpg");
  const file = `${p.slug}.${ext}`;
  report.push(`  ✓ ${p.slug}  ←  ${page.url}  (${page.title}) [${how}]`);
  manifest[p.slug] = `/products/${file}`;
  if (!DRY) {
    try {
      const r = await fetch(page.image, { headers: UA });
      if (!r.ok) throw new Error(String(r.status));
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 2048) throw new Error(`too small (${buf.length} B)`);
      await mkdir(OUT_DIR, { recursive: true });
      await writeFile(path.join(OUT_DIR, file), buf);
    } catch (e) { report.push(`    ! image ${e.message} ${page.image}`); delete manifest[p.slug]; }
  }
}
console.log(report.join("\n"));
console.log(`\nmatched ${Object.keys(manifest).length} / ${catalog.length}`);
if (!DRY) {
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`wrote ${MANIFEST}`);
}

async function loadCatalog() {
  // Read the TS source without a compiler: pull slug / brand / name triples.
  const { readFile } = await import("node:fs/promises");
  const src = await readFile("src/data/catalog.ts", "utf8");
  return [...src.matchAll(/slug:\s*"([^"]+)",\s*\n?\s*brand:\s*"([^"]+)",\s*category:\s*"[^"]+",\s*name:\s*"((?:[^"\\]|\\.)*)"/g)]
    .map((m) => ({ slug: m[1], brand: m[2], name: m[3].replace(/\\"/g, "\"") }));
}
