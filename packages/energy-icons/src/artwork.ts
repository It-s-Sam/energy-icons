import type { IconMaster } from "./types";

export interface MasterArtwork {
  viewBox: string;
  /** Inner SVG markup, paths untouched. */
  body: string;
}

export interface IconArtwork {
  regular: Record<IconMaster, MasterArtwork>;
  bold?: Record<IconMaster, MasterArtwork>;
}
