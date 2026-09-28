import { DEFAULT_ICON_WEIGHT, getMasterForSize, type IconMaster, type IconWeight } from "@/config/icons";
import type { IconName } from "@/data/icons";
import { iconRegistry } from "@/generated/icon-registry";
import { iconRegistryBold } from "@/generated/icon-registry-bold";
import type { IconMasterSource } from "./types";
import { withSize } from "./svg";
import { resolveWeight } from "./weight";

export { getIconFileName, hasWeight, resolveWeight } from "./weight";

/**
 * Full registries (both masters, both weights). Server rendering, docs and
 * tests use this. The browser loads one weight+master chunk at a time via
 * `browser-masters.ts` so the page does not ship every drawing up front.
 */
export function getIconSource(name: IconName, master: IconMaster, weight: IconWeight = DEFAULT_ICON_WEIGHT): IconMasterSource {
  if (resolveWeight(name, weight) === "bold") return iconRegistryBold[name]![master];
  return iconRegistry[name][master];
}

/**
 * Standalone SVG file contents for `name` at `size` in `weight`: the correct
 * optical master with width/height set to `size`. Path data is byte-identical
 * to the source.
 */
export function getIconSvg(name: IconName, size: number, weight: IconWeight = DEFAULT_ICON_WEIGHT): string {
  return withSize(getIconSource(name, getMasterForSize(size), weight).svg, size);
}
