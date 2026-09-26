import { getMasterForSize, type IconMaster } from "@/config/icons";
import type { IconName } from "@/data/icons";
import { iconRegistry } from "@/generated/icon-registry";
import type { IconMasterSource } from "./types";
import { withSize } from "./svg";

export function getIconSource(name: IconName, master: IconMaster): IconMasterSource {
  return iconRegistry[name][master];
}

/**
 * Standalone SVG file contents for `name` at `size`: the correct optical master
 * with width/height set to `size`. Path data is byte-identical to the source.
 */
export function getIconSvg(name: IconName, size: number): string {
  return withSize(getIconSource(name, getMasterForSize(size)).svg, size);
}

/** File name used by "Download SVG", e.g. `wind-turbine-24.svg`. */
export function getIconFileName(name: IconName, size: number): string {
  return `${name}-${size}.svg`;
}
