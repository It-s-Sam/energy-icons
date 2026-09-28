import { DEFAULT_ICON_WEIGHT, type IconWeight } from "@/config/icons";
import type { IconName } from "@/data/icons";
import { BOLD_SLUGS } from "@/generated/icon-bold-slugs";

const boldSlugs = new Set<string>(BOLD_SLUGS);

/** Whether `name` ships masters in `weight` (Regular always does). */
export function hasWeight(name: IconName, weight: IconWeight): boolean {
  return weight === "regular" || boldSlugs.has(name);
}

/**
 * The weight that will actually be rendered: `weight` if the icon has it,
 * otherwise Regular (icons without Bold masters fall back gracefully).
 */
export function resolveWeight(name: IconName, weight: IconWeight = DEFAULT_ICON_WEIGHT): IconWeight {
  return hasWeight(name, weight) ? weight : "regular";
}

/**
 * File name used by "Download SVG", e.g. `wind-turbine-24.svg`, or
 * `wind-turbine-24-bold.svg` for Bold.
 */
export function getIconFileName(name: IconName, size: number, weight: IconWeight = DEFAULT_ICON_WEIGHT): string {
  const resolved = resolveWeight(name, weight);
  return resolved === "regular" ? `${name}-${size}.svg` : `${name}-${size}-${resolved}.svg`;
}
