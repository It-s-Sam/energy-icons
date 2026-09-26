import { CATEGORIES, type CategoryId } from "@/data/categories";
import { icons, type IconName } from "@/data/icons";

export type IconEntry = (typeof icons)[number];
export type CategoryFilter = CategoryId | "all";

const normalise = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

/** Pre-computed lowercase haystack per icon: name, slug and keywords. */
const haystacks = new Map<IconName, string>(
  icons.map((icon) => [icon.slug, normalise([icon.name, icon.slug, ...icon.keywords].join(" | "))]),
);

/**
 * Filter by category and free-text query. Every whitespace-separated term must
 * match somewhere in the icon's name, slug or keywords.
 */
export function filterIcons(query: string, category: CategoryFilter): IconEntry[] {
  const terms = normalise(query).split(/\s+/).filter(Boolean);
  return icons.filter((icon) => {
    if (category !== "all" && icon.category !== category) return false;
    const haystack = haystacks.get(icon.slug)!;
    return terms.every((term) => haystack.includes(term));
  });
}

export interface CategoryWithCount {
  id: CategoryId;
  label: string;
  count: number;
}

/** Categories that currently have at least one icon, in sidebar order. */
export function getNonEmptyCategories(): CategoryWithCount[] {
  return CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    count: icons.filter((icon) => icon.category === category.id).length,
  })).filter((category) => category.count > 0);
}

export const TOTAL_ICONS = icons.length;
