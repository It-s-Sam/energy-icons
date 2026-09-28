/**
 * Site categories, in sidebar order.
 *
 * Mapped from the Figma categories (README → Categories, "site filter"):
 *   solar, wind, offshore, hydro, geothermal, nuclear → generation
 *   storage, charging, grid, electrical               → grid-storage
 *   heating, buildings                                → heat-buildings
 *   fuels                                             → fuels
 *   industry, climate, weather                        → climate
 *   transport                                         → transport
 *   minerals                                          → industry
 *   data                                              → data
 *   business                                          → business
 *   tools                                             → tools
 *   shapes, ui                                        → interface
 *
 * Categories with zero icons are hidden from the UI automatically, and appear
 * as soon as one icon uses them.
 */
export const CATEGORIES = [
  { id: "generation", label: "Generation" },
  { id: "grid-storage", label: "Grid & Storage" },
  { id: "heat-buildings", label: "Heat & Buildings" },
  { id: "fuels", label: "Fuels" },
  { id: "climate", label: "Climate" },
  { id: "transport", label: "Transport" },
  { id: "industry", label: "Industry" },
  { id: "data", label: "Data" },
  { id: "business", label: "Business" },
  { id: "tools", label: "Tools" },
  { id: "interface", label: "Interface" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CATEGORY_LABELS: Record<CategoryId, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label]),
) as Record<CategoryId, string>;

export function isCategoryId(value: string): value is CategoryId {
  return CATEGORIES.some((c) => c.id === value);
}
