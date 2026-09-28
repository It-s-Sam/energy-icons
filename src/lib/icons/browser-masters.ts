import { getMasterForSize, type IconMaster, type IconWeight } from "@/config/icons";
import type { IconName } from "@/data/icons";
import { iconRegistry as regular48 } from "@/generated/icon-registry-regular-48";
import type { IconMasterSource } from "./types";
import { withSize } from "./svg";
import { resolveWeight } from "./weight";

/**
 * Browser artwork, one chunk per weight and master.
 * Regular 48 is the default view (32px), so it is in the first load.
 * The other three load when that size or weight is actually used.
 */
export type MasterTable = Partial<Record<IconName, IconMasterSource>>;

const tables: Partial<Record<IconWeight, Partial<Record<IconMaster, MasterTable>>>> = {
  regular: { 48: regular48 },
};

const inflight = new Map<string, Promise<void>>();

const loaders: Record<IconWeight, Record<IconMaster, () => Promise<MasterTable>>> = {
  regular: {
    20: () => import("@/generated/icon-registry-regular-20").then((mod) => mod.iconRegistry),
    48: () => Promise.resolve(regular48),
  },
  bold: {
    20: () => import("@/generated/icon-registry-bold-20").then((mod) => mod.iconRegistry),
    48: () => import("@/generated/icon-registry-bold-48").then((mod) => mod.iconRegistry),
  },
};

export function peekMaster(weight: IconWeight, master: IconMaster): MasterTable | undefined {
  return tables[weight]?.[master];
}

/** Load the drawings for one weight at one master. Repeated calls share one request. */
export function loadMaster(weight: IconWeight, master: IconMaster): Promise<void> {
  if (tables[weight]?.[master]) return Promise.resolve();
  const id = `${weight}-${master}`;
  const pending = inflight.get(id);
  if (pending) return pending;
  const task = loaders[weight][master]().then((table) => {
    tables[weight] = { ...tables[weight], [master]: table };
  });
  inflight.set(id, task);
  return task;
}

export function getBrowserSource(name: IconName, master: IconMaster, weight: IconWeight): IconMasterSource {
  const resolved = resolveWeight(name, weight);
  const direct = tables[resolved]?.[master]?.[name];
  if (direct) return direct;
  const fallback = resolved === "bold" ? tables.regular?.[master]?.[name] : undefined;
  if (fallback) return fallback;
  throw new Error(`Icon "${name}" ${resolved} ${master} is not loaded`);
}

/** SVG file contents for copy / download in the browser, from the loaded chunk. */
export function getBrowserSvg(name: IconName, size: number, weight: IconWeight): string {
  return withSize(getBrowserSource(name, getMasterForSize(size), weight).svg, size);
}
