#!/usr/bin/env node
/**
 * Generate category banners with Google Gemini's image model and save them exactly
 * where compose-category-images.mjs does, so the storefront picks them up unchanged:
 *   public/categories/<slug>-tile.jpg  (3:4)   public/categories/<slug>-wide.jpg  (16:9, cropped to 16:6 by CSS)
 *   src/data/categoryImages.json
 *
 *   GEMINI_API_KEY=... node scripts/generate-category-images.mjs            # all six categories
 *   GEMINI_API_KEY=... node scripts/generate-category-images.mjs zahrada    # one category
 *   GEMINI_MODEL=gemini-2.5-flash-image  (default)                          # any Gemini model that returns images
 *
 * Get a key at https://aistudio.google.com/apikey. The *Generate category images*
 * GitHub Actions workflow runs this with the GEMINI_API_KEY repository secret and
 * commits the results. Prompts describe photographic scenes in the storefront's
 * style: natural light, muted studio tones, no text, no logos, no people's faces.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("GEMINI_API_KEY is not set. Create one at https://aistudio.google.com/apikey and re-run."); process.exit(1); }
const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash-image";
const OUT = "public/categories";
const MANIFEST = "src/data/categoryImages.json";
const only = process.argv.slice(2);

const STYLE = "Editorial product photography for a Czech electronics retailer's website. Natural soft daylight, muted neutral palette (off-white, warm grey, charcoal), shallow depth of field, calm and premium, lots of clean negative space for a text overlay in the lower third. Photorealistic, no text, no logos, no brand names, no watermarks, no people's faces.";
const PROMPTS = {
  "televize-audio": "A large slim flat-screen television on a low oak sideboard in a bright Scandinavian living room, screen showing a soft abstract gradient, a small Bluetooth speaker beside it, morning light from a side window.",
  "velke-spotrebice": "A modern kitchen and laundry corner with a tall stainless fridge freezer, a white front-loading washing machine and a built-in oven, matte grey cabinets, terrazzo floor, soft window light.",
  "male-spotrebice": "A kitchen worktop still life: an automatic bean-to-cup coffee machine pouring espresso into a white cup, a planetary stand mixer with a steel bowl, an air fryer, fresh bread, morning light, linen cloth.",
  "pocitace-telefony": "A tidy home office desk with an open thin laptop, a smartphone lying face up, a compact inkjet printer and a notebook, warm wooden desk, plant in the corner, soft daylight.",
  naradi: "A workshop bench with a cordless combi drill, an angle grinder and a rotary hammer laid on raw plywood, sawdust, a coiled extension cable, dramatic window light with dust in the air.",
  zahrada: "A Czech countryside garden in late summer: a red garden tractor mower on freshly cut grass beside an orchard, a cordless chainsaw resting on a woodpile, golden evening light, hills in the distance.",
};

async function generate(prompt, aspectRatio) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
  const body = { contents: [{ parts: [{ text: `${prompt}\n\n${STYLE}` }] }], generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio } } };
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  const part = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!part) throw new Error(`no image in response: ${JSON.stringify(j).slice(0, 300)}`);
  return { buf: Buffer.from(part.inlineData.data, "base64"), mime: part.inlineData.mimeType ?? "image/png" };
}

await mkdir(OUT, { recursive: true });
let manifest = {};
try { manifest = JSON.parse(await readFile(MANIFEST, "utf8")); } catch {}
for (const [slug, prompt] of Object.entries(PROMPTS)) {
  if (only.length && !only.includes(slug)) continue;
  manifest[slug] ??= {};
  for (const [kind, ratio] of [["tile", "3:4"], ["wide", "16:9"]]) {
    try {
      const { buf, mime } = await generate(prompt, ratio);
      const ext = mime.includes("png") ? "png" : "jpg";
      const file = `${slug}-${kind}.${ext}`;
      await writeFile(path.join(OUT, file), buf);
      manifest[slug][kind] = `/categories/${file}`;
      console.log(`  ✓ ${file} (${Math.round(buf.length / 1024)} kB)`);
    } catch (e) { console.error(`  ✗ ${slug} ${kind}: ${e.message}`); }
  }
}
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`wrote ${MANIFEST}`);
