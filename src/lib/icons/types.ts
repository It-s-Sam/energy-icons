import type { IconMaster } from "@/config/icons";

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
