import manifest from "@/data/images.json";
import categoryManifest from "@/data/categoryImages.json";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Public URL of a downloaded product image, or undefined while none exists. */
export const imageFor = (slug: string): string | undefined => {
  const p = (manifest as Record<string, string>)[slug];
  return p ? base + p : undefined;
};

/** Bundled category banner (composed from packshots or AI-generated), used when the admin has not uploaded one.
 *  `tile` is 3:4 for the home tiles, `wide` is landscape for the category page header. */
export const categoryImage = (slug: string, kind: "tile" | "wide"): string | undefined => {
  const p = (categoryManifest as Record<string, Partial<Record<"tile" | "wide", string>>>)[slug]?.[kind];
  return p ? base + p : undefined;
};
