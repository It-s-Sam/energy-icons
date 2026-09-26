/**
 * Site categories, in sidebar order.
 *
 * Seeded from the Figma categories in export/icons.json:
 *   solar, wind, hydro       → generation
 *   grid, storage, charging  → grid-storage
 *   heating                  → heat-buildings
 *   industry                 → climate
 *
 * Categories with zero icons are hidden from the UI automatically, and appear
 * as soon as one icon uses them (e.g. "fuels").
 */
export const CATEGORIES = [
  { id: "generation", label: "Generation" },
  { id: "grid-storage", label: "Grid & Storage" },
  { id: "heat-buildings", label: "Heat & Buildings" },
  { id: "fuels", label: "Fuels" },
  { id: "climate", label: "Climate" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CATEGORY_LABELS: Record<CategoryId, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label]),
) as Record<CategoryId, string>;

export function isCategoryId(value: string): value is CategoryId {
  return CATEGORIES.some((c) => c.id === value);
}
