import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(__dirname, "..");
export const ICONS_DIR = path.join(ROOT, "icons");

export const readSource = (slug: string, master: number, weight: "regular" | "bold" = "regular") =>
  readFileSync(path.join(ICONS_DIR, slug, weight === "regular" ? `${master}.svg` : `${master}-${weight}.svg`), "utf8");

/**
 * Icons knowingly shipped without Bold masters (Regular only). Keep this list
 * in sync with the generator's "no Bold weight" warning; it is empty while
 * every icon has Bold at both sizes.
 */
export const REGULAR_ONLY: readonly string[] = [];

export const iconFolders = () =>
  readdirSync(ICONS_DIR).filter((entry) => statSync(path.join(ICONS_DIR, entry)).isDirectory());
