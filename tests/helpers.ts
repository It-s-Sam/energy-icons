import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(__dirname, "..");
export const ICONS_DIR = path.join(ROOT, "icons");

export const readSource = (slug: string, master: number) =>
  readFileSync(path.join(ICONS_DIR, slug, `${master}.svg`), "utf8");

export const iconFolders = () =>
  readdirSync(ICONS_DIR).filter((entry) => statSync(path.join(ICONS_DIR, entry)).isDirectory());
