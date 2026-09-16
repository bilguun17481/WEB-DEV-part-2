#!/usr/bin/env node
/**
 * Download the product photos listed in src/data/imageSources.json (written by
 * scripts/build-catalog.mjs from the harvested shop data) into public/products/<slug>.<ext>
 * and write src/data/images.json (catalog slug -> public path).
 *
 *   node scripts/fetch-images.mjs            # download + write manifest
 *   node scripts/fetch-images.mjs --dry-run  # only list what would be fetched
 *
 * Needs network access to www.elektrodvorak.cz. `.github/workflows/fetch-images.yml`
 * runs this on GitHub Actions and commits the result to the branch.
 */
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { readdirSync } from "node:fs";
import path from "node:path";

const OUT_DIR = "public/products";
const MANIFEST = "src/data/images.json";
const DRY = process.argv.includes("--dry-run");
const UA = { "user-agent": "Mozilla/5.0 (compatible; elektrodvorak-mockup-fetch/1.0; +https://github.com/bilguun17481/WEB-DEV-part-2)" };

const sources = JSON.parse(await readFile("src/data/imageSources.json", "utf8"));
const manifest = {};
const report = [];
await mkdir(OUT_DIR, { recursive: true });
// Drop photos of products no longer in the catalog.
for (const f of readdirSync(OUT_DIR)) { const slug = f.replace(/\.[a-z]+$/, ""); if (f !== ".gitkeep" && !sources[slug]) { if (!DRY) await unlink(path.join(OUT_DIR, f)); report.push(`  − ${f} (no longer in catalog)`); } }

for (const [slug, { url, page }] of Object.entries(sources)) {
  const ext = (url.match(/\.(png|jpe?g|webp)(?:\?|$)/i)?.[1] ?? "jpg").toLowerCase().replace("jpeg", "jpg");
  const file = `${slug}.${ext}`;
  if (DRY) { report.push(`  · ${slug} ← ${url}`); manifest[slug] = `/products/${file}`; continue; }
  try {
    const r = await fetch(url, { headers: UA });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 2048) throw new Error(`too small (${buf.length} B)`);
    await writeFile(path.join(OUT_DIR, file), buf);
    manifest[slug] = `/products/${file}`;
    report.push(`  ✓ ${slug}  (${Math.round(buf.length / 1024)} kB)  ${page}`);
  } catch (e) { report.push(`  ✗ ${slug}  ${e.message}  ${url}`); }
}
console.log(report.join("\n"));
console.log(`\nfetched ${Object.keys(manifest).length} / ${Object.keys(sources).length}`);
if (!DRY) { await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n"); console.log(`wrote ${MANIFEST}`); }
