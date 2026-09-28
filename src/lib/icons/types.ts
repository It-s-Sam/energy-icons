import type { IconMaster } from "@/config/icons";
import type { IconName } from "@/data/icons";

/** One master of one icon, as stored in the generated registry. */
export interface IconMasterSource {
  /** e.g. "0 0 20 20" */
  viewBox: string;
  /** Exact inner markup of the source file (paths untouched) */
  body: string;
  /** Exact source file contents */
  svg: string;
}

export type IconSources = Record<IconMaster, IconMasterSource>;

/** Bold masters, when an icon has them (missing weights fall back to Regular). */
export type IconBoldSources = Partial<Record<IconName, IconSources>>;
