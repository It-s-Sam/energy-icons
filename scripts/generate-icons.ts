/**
 * Validates /icons against src/data/icons.ts and generates:
 *   - src/generated/icon-registry.ts   (SVG markup the <Icon> component renders)
 *   - public/downloads/wild-icons.zip  (the "Download all" archive)
 *
 * Runs automatically before `dev`, `build`, `typecheck` and `test`.
 * Exits non-zero, listing every problem, if metadata and folders disagree or a
 * master file is malformed.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { zipSync, strToU8 } from "fflate";

import { ICON_MASTERS } from "../src/config/icons";
import { CATEGORIES, CATEGORY_LABELS } from "../src/data/categories";
import { icons, type IconMeta } from "../src/data/icons";
import { parseSvg } from "../src/lib/icons/svg";

const ROOT = path.resolve(__dirname, "..");
const ICONS_DIR = path.join(ROOT, "icons");
const REGISTRY_FILE = path.join(ROOT, "src/generated/icon-registry.ts");
const ZIP_FILE = path.join(ROOT, "public/downloads/wild-icons.zip");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Fixed timestamp so the zip is reproducible between builds. */
const ZIP_MTIME = new Date("2026-01-01T00:00:00Z");

const errors: string[] = [];
const warnings: string[] = [];
const rel = (p: string) => path.relative(ROOT, p);

// ---------------------------------------------------------------------------
// 1. Metadata sanity
// ---------------------------------------------------------------------------
const seen = new Set<string>();
for (const icon of icons as readonly IconMeta[]) {
  if (seen.has(icon.slug)) errors.push(`Duplicate metadata slug "${icon.slug}" in src/data/icons.ts`);
  seen.add(icon.slug);
  if (!SLUG_PATTERN.test(icon.slug)) errors.push(`Slug "${icon.slug}" must be kebab-case (a-z, 0-9, -)`);
  if (!icon.name.trim()) errors.push(`Icon "${icon.slug}" has an empty name`);
  if (icon.keywords.length === 0) warnings.push(`Icon "${icon.slug}" has no keywords (search will only match its name/slug)`);
}

// ---------------------------------------------------------------------------
// 2. Folders <-> metadata, one-to-one
// ---------------------------------------------------------------------------
if (!existsSync(ICONS_DIR)) {
  errors.push(`Missing icons folder: ${rel(ICONS_DIR)}`);
}
const folders = existsSync(ICONS_DIR)
  ? readdirSync(ICONS_DIR).filter((entry) => statSync(path.join(ICONS_DIR, entry)).isDirectory())
  : [];

for (const folder of folders) {
  if (!seen.has(folder)) {
    errors.push(`Folder icons/${folder}/ has no metadata entry. Add { slug: "${folder}", … } to src/data/icons.ts`);
  }
}

// ---------------------------------------------------------------------------
// 3. Master files
// ---------------------------------------------------------------------------
type Master = (typeof ICON_MASTERS)[number];
const sources = new Map<string, Record<Master, string>>();

for (const icon of icons) {
  const dir = path.join(ICONS_DIR, icon.slug);
  const files = {} as Record<Master, string>;
  let complete = true;

  for (const master of ICON_MASTERS) {
    const file = path.join(dir, `${master}.svg`);
    if (!existsSync(file)) {
      errors.push(`Icon "${icon.slug}" is missing ${rel(file)}`);
      complete = false;
      continue;
    }
    const svg = readFileSync(file, "utf8");
    files[master] = svg;

    let parsed;
    try {
      parsed = parseSvg(svg);
    } catch (error) {
      errors.push(`${rel(file)}: ${(error as Error).message}`);
      complete = false;
      continue;
    }

    const expectedViewBox = `0 0 ${master} ${master}`;
    if (parsed.attributes.viewBox !== expectedViewBox) {
      errors.push(`${rel(file)}: viewBox must be "${expectedViewBox}" (found "${parsed.attributes.viewBox ?? "none"}")`);
    }
    if (/<script|\son[a-z]+=/i.test(svg)) errors.push(`${rel(file)}: scripts / event handlers are not allowed`);
    if (/vector-effect|non-scaling-stroke/.test(svg)) errors.push(`${rel(file)}: non-scaling-stroke is not allowed; masters must scale proportionally`);
    if (/<(image|foreignObject|style)\b/.test(svg)) errors.push(`${rel(file)}: <image>, <foreignObject> and <style> are not allowed`);
    if (/\sid="/.test(svg)) warnings.push(`${rel(file)}: contains id attributes, which can collide when inlined several times`);
    if (/\sstroke(-width)?="/.test(svg)) warnings.push(`${rel(file)}: contains strokes; masters are expected to be outlined (fill only)`);
    const fills = [...svg.matchAll(/\sfill="([^"]*)"/g)].map((m) => m[1]).filter((f) => f !== "currentColor" && f !== "none");
    if (fills.length) warnings.push(`${rel(file)}: hard-coded fill(s) ${[...new Set(fills)].join(", ")}; use currentColor so icons inherit text colour`);
  }

  if (complete) sources.set(icon.slug, files);

  if (existsSync(dir)) {
    for (const extra of readdirSync(dir)) {
      if (!ICON_MASTERS.some((m) => extra === `${m}.svg`)) warnings.push(`Unexpected file icons/${icon.slug}/${extra} (ignored)`);
    }
  }
}

for (const warning of warnings) console.warn(`  ⚠ ${warning}`);

if (errors.length) {
  console.error(`\n✖ Icon validation failed with ${errors.length} error(s):\n`);
  for (const error of errors) console.error(`  • ${error}`);
  console.error("");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 4. Registry
// ---------------------------------------------------------------------------
const entries = icons.map((icon) => {
  const files = sources.get(icon.slug)!;
  const masters = ICON_MASTERS.map((master) => {
    const { attributes, body } = parseSvg(files[master]);
    return `    ${master}: {\n      viewBox: ${JSON.stringify(attributes.viewBox)},\n      body: ${JSON.stringify(body)},\n      svg: ${JSON.stringify(files[master])},\n    },`;
  });
  return `  ${JSON.stringify(icon.slug)}: {\n${masters.join("\n")}\n  },`;
});

const registry = `// AUTO-GENERATED by scripts/generate-icons.ts from /icons. Do not edit by hand.
// Run \`npm run icons\` to regenerate (it runs automatically before dev/build).
import type { IconName } from "@/data/icons";
import type { IconSources } from "@/lib/icons/types";

export const iconRegistry: Record<IconName, IconSources> = {
${entries.join("\n")}
};
`;

mkdirSync(path.dirname(REGISTRY_FILE), { recursive: true });
if (!existsSync(REGISTRY_FILE) || readFileSync(REGISTRY_FILE, "utf8") !== registry) {
  writeFileSync(REGISTRY_FILE, registry);
}

// ---------------------------------------------------------------------------
// 5. Download-all zip
// ---------------------------------------------------------------------------
const zipEntries: Record<string, [Uint8Array, { mtime: Date }]> = {};
const opts = { mtime: ZIP_MTIME };
for (const icon of icons) {
  for (const master of ICON_MASTERS) {
    zipEntries[`wild-icons/icons/${icon.slug}/${master}.svg`] = [
      readFileSync(path.join(ICONS_DIR, icon.slug, `${master}.svg`)),
      opts,
    ];
  }
}
const manifest = {
  name: "Wild Icons",
  categories: CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
  icons: icons.map((icon) => ({
    slug: icon.slug,
    name: icon.name,
    category: icon.category,
    categoryLabel: CATEGORY_LABELS[icon.category],
    keywords: icon.keywords,
    svg: Object.fromEntries(ICON_MASTERS.map((m) => [m, `icons/${icon.slug}/${m}.svg`])),
  })),
};
zipEntries["wild-icons/icons.json"] = [strToU8(`${JSON.stringify(manifest, null, 2)}\n`), opts];

mkdirSync(path.dirname(ZIP_FILE), { recursive: true });
writeFileSync(ZIP_FILE, zipSync(zipEntries, { level: 9 }));

console.log(
  `✓ ${icons.length} icons validated · registry → ${rel(REGISTRY_FILE)} · zip → ${rel(ZIP_FILE)}`,
);
