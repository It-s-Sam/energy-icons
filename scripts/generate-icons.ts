/**
 * Validates /icons against src/data/icons.ts and generates:
 *   - src/generated/icon-registry.ts            (Regular SVG, both masters — server and tests)
 *   - src/generated/icon-registry-bold.ts       (Bold SVG, both masters — server and tests)
 *   - src/generated/icon-registry-<weight>-<master>.ts  (one browser chunk per weight and master)
 *   - src/generated/icon-bold-slugs.ts          (which icons have Bold, without the artwork)
 *   - public/downloads/energy-icons.zip  (the "Download all" archive)
 *
 * Runs automatically before `dev`, `build`, `typecheck` and `test`.
 * Exits non-zero, listing every problem, if metadata and folders disagree or a
 * master file is malformed.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { zipSync, strToU8 } from "fflate";

import { getMasterFileName, ICON_MASTERS, ICON_WEIGHTS, type IconWeight } from "../src/config/icons";
import { siteConfig } from "../src/config/site";
import { CATEGORIES, CATEGORY_LABELS } from "../src/data/categories";
import { icons, type IconMeta } from "../src/data/icons";
import { parseSvg } from "../src/lib/icons/svg";

const ROOT = path.resolve(__dirname, "..");
const ICONS_DIR = path.join(ROOT, "icons");
const REGISTRY_FILE = path.join(ROOT, "src/generated/icon-registry.ts");
const BOLD_REGISTRY_FILE = path.join(ROOT, "src/generated/icon-registry-bold.ts");
const ZIP_FILE = path.join(ROOT, "public/downloads/energy-icons.zip");
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
//    Regular (`20.svg`, `48.svg`) is required. Bold (`20-bold.svg`,
//    `48-bold.svg`) is optional per icon: an icon without both Bold masters
//    stays Regular-only and the UI falls back to Regular for it.
// ---------------------------------------------------------------------------
type Master = (typeof ICON_MASTERS)[number];
const sources = new Map<string, Record<Master, string>>();
const boldSources = new Map<string, Record<Master, string>>();
const missingBold: string[] = [];

/** Read and validate one master file. Returns its source, or undefined if unusable. */
function readMaster(slug: string, master: Master, weight: IconWeight, required: boolean): string | undefined {
  const file = path.join(ICONS_DIR, slug, getMasterFileName(master, weight));
  if (!existsSync(file)) {
    if (required) errors.push(`Icon "${slug}" is missing ${rel(file)}`);
    return undefined;
  }
  const svg = readFileSync(file, "utf8");

  let parsed;
  try {
    parsed = parseSvg(svg);
  } catch (error) {
    errors.push(`${rel(file)}: ${(error as Error).message}`);
    return undefined;
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
  return svg;
}

const expectedFiles = new Set(ICON_WEIGHTS.flatMap((weight) => ICON_MASTERS.map((master) => getMasterFileName(master, weight))));

for (const icon of icons) {
  const dir = path.join(ICONS_DIR, icon.slug);

  const regular = ICON_MASTERS.map((master) => readMaster(icon.slug, master, "regular", true));
  if (regular.every((svg) => svg !== undefined)) {
    sources.set(icon.slug, Object.fromEntries(ICON_MASTERS.map((m, i) => [m, regular[i]])) as Record<Master, string>);
  }

  const bold = ICON_MASTERS.map((master) => readMaster(icon.slug, master, "bold", false));
  if (bold.every((svg) => svg !== undefined)) {
    boldSources.set(icon.slug, Object.fromEntries(ICON_MASTERS.map((m, i) => [m, bold[i]])) as Record<Master, string>);
  } else {
    missingBold.push(icon.slug);
    if (bold.some((svg) => svg !== undefined)) {
      warnings.push(`Icon "${icon.slug}" has only some Bold masters; it is shown Regular-only until both ${ICON_MASTERS.map((m) => getMasterFileName(m, "bold")).join(" and ")} exist`);
    }
  }

  if (existsSync(dir)) {
    for (const extra of readdirSync(dir)) {
      if (!expectedFiles.has(extra)) warnings.push(`Unexpected file icons/${icon.slug}/${extra} (ignored)`);
    }
  }
}

if (missingBold.length) warnings.push(`${missingBold.length} icon(s) have no Bold weight (Regular only): ${missingBold.join(", ")}`);

for (const warning of warnings) console.warn(`  ⚠ ${warning}`);

if (errors.length) {
  console.error(`\n✖ Icon validation failed with ${errors.length} error(s):\n`);
  for (const error of errors) console.error(`  • ${error}`);
  console.error("");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 4. Registries
//    Each master is stored once, as the source SVG. viewBox and inner markup
//    are derived at load so path data is not sent twice. Regular and Bold
//    live in separate generated modules so Bold can be split out later.
// ---------------------------------------------------------------------------
function registryEntry(slug: string, files: Record<Master, string>): string {
  const masters = ICON_MASTERS.map((master) => `    ${master}: toMasterSource(${JSON.stringify(files[master])}),`);
  return `  ${JSON.stringify(slug)}: {\n${masters.join("\n")}\n  },`;
}

function writeIfChanged(file: string, contents: string) {
  mkdirSync(path.dirname(file), { recursive: true });
  if (!existsSync(file) || readFileSync(file, "utf8") !== contents) writeFileSync(file, contents);
}

const entries = icons.map((icon) => registryEntry(icon.slug, sources.get(icon.slug)!));

const registry = `// AUTO-GENERATED by scripts/generate-icons.ts from /icons. Do not edit by hand.
// Run \`npm run icons\` to regenerate (it runs automatically before dev/build).
// Each master is the source SVG once. toMasterSource derives viewBox and body.
import type { IconName } from "@/data/icons";
import type { IconSources } from "@/lib/icons/types";
import { toMasterSource } from "@/lib/icons/svg";

export const iconRegistry: Record<IconName, IconSources> = {
${entries.join("\n")}
};
`;
writeIfChanged(REGISTRY_FILE, registry);

const boldEntries = icons.filter((icon) => boldSources.has(icon.slug)).map((icon) => registryEntry(icon.slug, boldSources.get(icon.slug)!));

const boldRegistry = `// AUTO-GENERATED by scripts/generate-icons.ts from /icons (*-bold.svg). Do not edit by hand.
// Run \`npm run icons\` to regenerate (it runs automatically before dev/build).
// Icons without both Bold masters are absent here and render as Regular.
// Each master is the source SVG once. toMasterSource derives viewBox and body.
import type { IconBoldSources } from "@/lib/icons/types";
import { toMasterSource } from "@/lib/icons/svg";

export const iconRegistryBold: IconBoldSources = {
${boldEntries.join("\n")}
};
`;
writeIfChanged(BOLD_REGISTRY_FILE, boldRegistry);

// One browser chunk per weight and master, plus the slug list used to know
// whether Bold exists without downloading the drawings.
const chunkType = "Partial<Record<IconName, IconMasterSource>>";
function writeChunk(weight: IconWeight, master: Master, map: Map<string, Record<Master, string>>) {
  const entries = icons
    .filter((icon) => map.has(icon.slug))
    .map((icon) => `  ${JSON.stringify(icon.slug)}: toMasterSource(${JSON.stringify(map.get(icon.slug)![master])}),`);
  const file = path.join(ROOT, "src/generated", `icon-registry-${weight}-${master}.ts`);
  writeIfChanged(
    file,
    `// AUTO-GENERATED by scripts/generate-icons.ts. Do not edit by hand.
// Browser chunk: ${weight} ${master} master. The page loads one of these at a time.
import type { IconName } from "@/data/icons";
import type { IconMasterSource } from "@/lib/icons/types";
import { toMasterSource } from "@/lib/icons/svg";

export const iconRegistry: ${chunkType} = {
${entries.join("\n")}
};
`,
  );
}

for (const weight of ICON_WEIGHTS) {
  const map = weight === "regular" ? sources : boldSources;
  for (const master of ICON_MASTERS) writeChunk(weight, master, map);
}

const boldSlugList = icons.filter((icon) => boldSources.has(icon.slug)).map((icon) => `  ${JSON.stringify(icon.slug)},`);
writeIfChanged(
  path.join(ROOT, "src/generated/icon-bold-slugs.ts"),
  `// AUTO-GENERATED by scripts/generate-icons.ts. Do not edit by hand.
import type { IconName } from "@/data/icons";

export const BOLD_SLUGS: readonly IconName[] = [
${boldSlugList.join("\n")}
];
`,
);

// ---------------------------------------------------------------------------
// 5. Download-all zip
// ---------------------------------------------------------------------------
const zipEntries: Record<string, [Uint8Array, { mtime: Date }]> = {};
const opts = { mtime: ZIP_MTIME };
/** Weights actually available for an icon, Regular first. */
const weightsFor = (slug: string): IconWeight[] => ICON_WEIGHTS.filter((weight) => weight === "regular" || boldSources.has(slug));
for (const icon of icons) {
  for (const weight of weightsFor(icon.slug)) {
    for (const master of ICON_MASTERS) {
      const fileName = getMasterFileName(master, weight);
      zipEntries[`energy-icons/icons/${icon.slug}/${fileName}`] = [readFileSync(path.join(ICONS_DIR, icon.slug, fileName)), opts];
    }
  }
}
const manifest = {
  name: siteConfig.name,
  weights: ICON_WEIGHTS,
  categories: CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
  icons: icons.map((icon) => ({
    slug: icon.slug,
    name: icon.name,
    category: icon.category,
    categoryLabel: CATEGORY_LABELS[icon.category],
    keywords: icon.keywords,
    weights: weightsFor(icon.slug),
    svg: Object.fromEntries(
      weightsFor(icon.slug).flatMap((weight) =>
        ICON_MASTERS.map((m) => {
          const fileName = getMasterFileName(m, weight);
          return [fileName.replace(/\.svg$/, ""), `icons/${icon.slug}/${fileName}`];
        }),
      ),
    ),
  })),
};
zipEntries["energy-icons/icons.json"] = [strToU8(`${JSON.stringify(manifest, null, 2)}\n`), opts];
// The MIT notice travels with the files.
zipEntries["energy-icons/LICENSE"] = [readFileSync(path.join(ROOT, "LICENSE")), opts];

mkdirSync(path.dirname(ZIP_FILE), { recursive: true });
writeFileSync(ZIP_FILE, zipSync(zipEntries, { level: 9 }));

console.log(
  `✓ ${icons.length} icons validated (${boldSources.size} with Bold) · registry → ${rel(REGISTRY_FILE)} + ${path.basename(BOLD_REGISTRY_FILE)} · zip → ${rel(ZIP_FILE)}`,
);
