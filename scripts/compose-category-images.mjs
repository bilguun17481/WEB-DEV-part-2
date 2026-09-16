#!/usr/bin/env node
/**
 * Compose category banners from the product packshots already in public/products/.
 * No external service needed: an HTML scene is rendered with the bundled Chromium
 * (playwright-core) and saved as JPEG. Two crops per category:
 *   public/categories/<slug>-tile.jpg   1200×1600  (home category tiles, 3:4)
 *   public/categories/<slug>-wide.jpg   2400×900   (category page header, 16:6)
 * and src/data/categoryImages.json listing what exists.
 *
 *   node scripts/compose-category-images.mjs
 *
 * `scripts/generate-category-images.mjs` can replace these with AI-generated scenes
 * (Gemini) once an API key is available; both write the same files and manifest.
 */
import { chromium } from "playwright-core";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const OUT = "public/categories";
const MANIFEST = "src/data/categoryImages.json";
const images = JSON.parse(await readFile("src/data/images.json", "utf8"));

/** Which packshots make up each scene: [hero, left, right]. */
const SCENES = {
  "televize-audio": ["sencor-sle-55us804b", "jbl-charge-5", "gogen-cdm-490-bt-dab"],
  "velke-spotrebice": ["hisense-rb395n4bce", "philco-pldi-148-asw", "mora-c-4245-aw"],
  "male-spotrebice": ["delonghi-ecam-290-51-b-magnifica-evo", "eta-fenix-1233-90000", "sencor-sfr-5010-bk"],
  "pocitace-telefony": ["asus-vivobook-15-m1505ya-oled", "xiaomi-redmi-note-14-5g-256gb", "canon-pixma-g3470"],
  naradi: ["graphite-energy-plus-58g020", "makita-ga5030r", "einhell-te-ag-125-ce"],
  zahrada: ["al-ko-524-vs-b-premium", "al-ko-474-sp-h-premium", "einhell-fortexxa-18-30"],
};

const abs = (slug) => `file://${path.resolve("public" + images[slug])}`;
const page_ = (w, h, [hero, left, right], wide) => `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden}
  .scene{position:relative;width:${w}px;height:${h}px;background:radial-gradient(120% 90% at 50% 30%, #ffffff 0%, #f1f1ef 50%, #dedfd9 100%)}
  .floor{position:absolute;left:0;right:0;bottom:0;height:34%;background:linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 100%)}
  img,canvas{position:absolute;object-fit:contain;filter:drop-shadow(0 ${wide ? 30 : 40}px ${wide ? 50 : 70}px rgba(0,0,0,0.22))}
  canvas{object-fit:contain}
  .shadow{position:absolute;border-radius:50%;background:rgba(0,0,0,0.18);filter:blur(${wide ? 28 : 40}px)}
  ${wide ? `
  .hero{left:36%;top:9%;width:30%;height:80%}
  .left{left:6%;top:24%;width:24%;height:60%;opacity:.96}
  .right{left:70%;top:26%;width:24%;height:58%;opacity:.96}
  .s1{left:38%;bottom:6%;width:26%;height:7%} .s2{left:8%;bottom:8%;width:20%;height:6%} .s3{left:72%;bottom:9%;width:20%;height:6%}` : `
  .hero{left:12%;top:26%;width:76%;height:58%}
  .left{left:-4%;top:12%;width:46%;height:34%;opacity:.94}
  .right{left:58%;top:10%;width:46%;height:34%;opacity:.94}
  .s1{left:20%;bottom:10%;width:60%;height:5%}`}
</style></head><body><div class="scene"><div class="floor"></div>
  <div class="shadow s1"></div>${wide ? '<div class="shadow s2"></div><div class="shadow s3"></div>' : ""}
  <img class="left" src="${abs(left)}"><img class="right" src="${abs(right)}"><img class="hero" src="${abs(hero)}">
</div>
<script>
  // Packshots come on white (never perfectly white after JPEG). Turn near-white pixels transparent, with a soft
  // ramp, so the products sit on the studio gradient instead of in white boxes. Runs on file:// thanks to
  // --allow-file-access-from-files.
  window.keyed = Promise.all([...document.images].map((img) => img.decode().then(() => {
    const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight; c.className = img.className;
    const g = c.getContext("2d"); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height), px = d.data;
    for (let i = 0; i < px.length; i += 4) {
      const lo = Math.min(px[i], px[i + 1], px[i + 2]), hi = Math.max(px[i], px[i + 1], px[i + 2]);
      if (lo >= 246 && hi - lo < 12) px[i + 3] = 0;
      else if (lo >= 222 && hi - lo < 16) px[i + 3] = Math.round(((246 - lo) / 24) * 255);
    }
    g.putImageData(d, 0, 0);
    // object-fit does not apply to canvas bitmaps the same way, so fit it manually inside the img box.
    const r = img.getBoundingClientRect(), s = Math.min(r.width / c.width, r.height / c.height);
    c.style.width = c.width * s + "px"; c.style.height = c.height * s + "px";
    c.style.left = r.left + (r.width - c.width * s) / 2 + "px"; c.style.top = r.top + (r.height - c.height * s) / 2 + "px";
    img.replaceWith(c);
  }).catch(() => {})));
</script></body></html>`;

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium", args: ["--allow-file-access-from-files"] });
const manifest = {};
for (const [slug, scene] of Object.entries(SCENES)) {
  if (scene.some((s) => !images[s])) { console.warn(`skip ${slug}: missing product photo`); continue; }
  manifest[slug] = {};
  for (const [kind, w, h] of [["tile", 1200, 1600], ["wide", 2400, 900]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    // Written to disk and opened as file:// so the packshots (also file://) are allowed to load.
    const tmp = path.join(os.tmpdir(), `scene-${slug}-${kind}.html`);
    await writeFile(tmp, page_(w, h, scene, kind === "wide"));
    await page.goto(`file://${tmp}`, { waitUntil: "load" });
    await page.evaluate(() => window.keyed);
    const file = `${slug}-${kind}.jpg`;
    await page.screenshot({ path: path.join(OUT, file), type: "jpeg", quality: 82 });
    await page.close();
    await rm(tmp, { force: true });
    manifest[slug][kind] = `/categories/${file}`;
    console.log(`  ✓ ${file}`);
  }
}
await browser.close();
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`wrote ${MANIFEST} (${Object.keys(manifest).length} categories)`);
