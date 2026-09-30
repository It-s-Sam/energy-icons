import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { unzipSync, strFromU8 } from "fflate";

import {
  ICON_MASTERS,
  ICON_WEIGHTS,
  OPTICAL_MASTER_BREAKPOINT,
  SUPPORTED_SIZES,
  getMasterFileName,
  getMasterForSize,
  snapToSupportedSize,
} from "../src/config/icons";
import { CATEGORIES } from "../src/data/categories";
import { icons } from "../src/data/icons";
import { BOLD_SLUGS } from "../src/generated/icon-bold-slugs";
import { iconRegistry } from "../src/generated/icon-registry";
import { iconRegistry as chunkRegular20 } from "../src/generated/icon-registry-regular-20";
import { iconRegistry as chunkRegular48 } from "../src/generated/icon-registry-regular-48";
import { iconRegistry as chunkBold20 } from "../src/generated/icon-registry-bold-20";
import { iconRegistry as chunkBold48 } from "../src/generated/icon-registry-bold-48";
import { iconRegistryBold } from "../src/generated/icon-registry-bold";
import { getIconFileName, getIconSvg, hasWeight, resolveWeight } from "../src/lib/icons";
import { FRAMEWORKS, getIconSnippet } from "../src/lib/icons/snippets";
import { filterIcons, getNonEmptyCategories } from "../src/lib/icons/filter";
import { extractPathData, parseSvg, withSize } from "../src/lib/icons/svg";
import { ICONS_DIR, REGULAR_ONLY, ROOT, iconFolders, readSource } from "./helpers";

/** Weights each icon ships, Regular first. */
const weightsOf = (slug: string) => ICON_WEIGHTS.filter((w) => w === "regular" || !REGULAR_ONLY.includes(slug));

describe("config", () => {
  it("uses the 20 master below the breakpoint and the 48 master from it", () => {
    assert.equal(OPTICAL_MASTER_BREAKPOINT, 32);
    const expected: Record<number, 20 | 48> = { 12: 20, 14: 20, 16: 20, 18: 20, 20: 20, 24: 20, 28: 20, 32: 48, 40: 48, 48: 48, 64: 48 };
    assert.deepEqual([...SUPPORTED_SIZES], [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64]);
    for (const size of SUPPORTED_SIZES) assert.equal(getMasterForSize(size), expected[size], `size ${size}`);
    assert.equal(getMasterForSize(31.9), 20);
  });

  it("names master files per weight", () => {
    assert.deepEqual([...ICON_WEIGHTS], ["regular", "bold"]);
    assert.equal(getMasterFileName(20), "20.svg");
    assert.equal(getMasterFileName(48, "regular"), "48.svg");
    assert.equal(getMasterFileName(20, "bold"), "20-bold.svg");
    assert.equal(getMasterFileName(48, "bold"), "48-bold.svg");
  });

  it("snaps arbitrary values to supported sizes", () => {
    assert.equal(snapToSupportedSize(25), 24);
    assert.equal(snapToSupportedSize(100), 64);
    assert.equal(snapToSupportedSize(1), 12);
  });
});

describe("data integrity", () => {
  it("has one icon per folder, with unique slugs", () => {
    assert.equal(icons.length, iconFolders().length);
    assert.equal(new Set(icons.map((i) => i.slug)).size, icons.length);
  });

  it("every metadata entry has both master files", () => {
    for (const icon of icons) {
      for (const master of ICON_MASTERS) {
        assert.ok(existsSync(path.join(ICONS_DIR, icon.slug, `${master}.svg`)), `${icon.slug}/${master}.svg`);
      }
    }
  });

  it("every icon has Bold masters at both sizes (unless listed as Regular only)", () => {
    for (const slug of REGULAR_ONLY) assert.ok(icons.some((i) => i.slug === slug), `REGULAR_ONLY lists unknown icon ${slug}`);
    for (const icon of icons) {
      const expectBold = !REGULAR_ONLY.includes(icon.slug);
      for (const master of ICON_MASTERS) {
        const exists = existsSync(path.join(ICONS_DIR, icon.slug, `${master}-bold.svg`));
        assert.equal(exists, expectBold, `${icon.slug}/${master}-bold.svg`);
      }
      assert.equal(hasWeight(icon.slug, "bold"), expectBold, `${icon.slug} bold in registry`);
      assert.equal(resolveWeight(icon.slug, "bold"), expectBold ? "bold" : "regular");
      assert.equal(resolveWeight(icon.slug, "regular"), "regular");
    }
  });

  it("Bold masters are separate drawings, never copies of Regular", () => {
    for (const icon of icons) {
      if (!hasWeight(icon.slug, "bold")) continue;
      for (const master of ICON_MASTERS) {
        assert.notDeepEqual(
          extractPathData(readSource(icon.slug, master, "bold")),
          extractPathData(readSource(icon.slug, master)),
          `${icon.slug}/${master}-bold.svg is identical to Regular`,
        );
      }
    }
  });

  it("every icon folder has a metadata entry", () => {
    const slugs = new Set<string>(icons.map((i) => i.slug));
    for (const folder of iconFolders()) assert.ok(slugs.has(folder), `icons/${folder} has no metadata`);
  });

  it("the generated registry matches the files on disk (not stale)", () => {
    for (const icon of icons) {
      for (const master of ICON_MASTERS) {
        const source = readSource(icon.slug, master);
        const entry = iconRegistry[icon.slug][master];
        assert.equal(entry.svg, source);
        assert.equal(entry.body, parseSvg(source).body);
        assert.equal(entry.viewBox, `0 0 ${master} ${master}`);
        const regularChunk = master === 20 ? chunkRegular20 : chunkRegular48;
        assert.equal(regularChunk[icon.slug]?.svg, source, `${icon.slug} regular ${master} chunk`);
        const bold = iconRegistryBold[icon.slug];
        if (!REGULAR_ONLY.includes(icon.slug)) {
          assert.ok(bold, `${icon.slug} missing from the Bold registry`);
          const boldSource = readSource(icon.slug, master, "bold");
          assert.equal(bold[master].svg, boldSource);
          assert.equal(bold[master].body, parseSvg(boldSource).body);
          assert.equal(bold[master].viewBox, `0 0 ${master} ${master}`);
          const boldChunk = master === 20 ? chunkBold20 : chunkBold48;
          assert.equal(boldChunk[icon.slug]?.svg, boldSource, `${icon.slug} bold ${master} chunk`);
        } else {
          assert.equal(bold, undefined);
          const boldChunk = master === 20 ? chunkBold20 : chunkBold48;
          assert.equal(boldChunk[icon.slug], undefined);
        }
      }
    }
    assert.equal(Object.keys(iconRegistryBold).length, icons.length - REGULAR_ONLY.length);
    assert.equal(BOLD_SLUGS.length, icons.length - REGULAR_ONLY.length);
  });
});

describe("copy / download output", () => {
  for (const icon of icons) {
    it(`${icon.slug}: every size and weight uses the right master with byte-identical paths`, () => {
      for (const weight of weightsOf(icon.slug)) {
        for (const size of SUPPORTED_SIZES) {
          const master = getMasterForSize(size);
          const source = readSource(icon.slug, master, weight);
          const output = getIconSvg(icon.slug, size, weight);
          const parsedOut = parseSvg(output);
          const parsedSrc = parseSvg(source);

          assert.equal(parsedOut.attributes.width, String(size));
          assert.equal(parsedOut.attributes.height, String(size));
          assert.equal(parsedOut.attributes.viewBox, `0 0 ${master} ${master}`);
          // Everything after the root tag is byte-identical to the source file.
          assert.equal(output.slice(parsedOut.bodyStart), source.slice(parsedSrc.bodyStart));
          assert.deepEqual(extractPathData(output), extractPathData(source));
          assert.ok(extractPathData(source).length > 0);
          // Only width/height differ: restoring them reproduces the source exactly.
          assert.equal(withSize(output, master), source);
          assert.equal(
            getIconFileName(icon.slug, size, weight),
            weight === "regular" ? `${icon.slug}-${size}.svg` : `${icon.slug}-${size}-${weight}.svg`,
          );
        }
      }
      // Default weight is Regular.
      assert.equal(getIconSvg(icon.slug, 24), getIconSvg(icon.slug, 24, "regular"));
      assert.equal(getIconFileName(icon.slug, 24), `${icon.slug}-24.svg`);
    });
  }
});

describe("download-all zip", () => {
  it("contains every master byte-for-byte plus a manifest", () => {
    const zip = unzipSync(new Uint8Array(readFileSync(path.join(ROOT, "public/downloads/energy-icons.zip"))));
    for (const icon of icons) {
      for (const weight of weightsOf(icon.slug)) {
        for (const master of ICON_MASTERS) {
          const fileName = getMasterFileName(master, weight);
          const entry = zip[`energy-icons/icons/${icon.slug}/${fileName}`];
          assert.ok(entry, `${icon.slug}/${fileName} in zip`);
          assert.equal(strFromU8(entry), readSource(icon.slug, master, weight));
        }
      }
    }
    const manifest = JSON.parse(strFromU8(zip["energy-icons/icons.json"]));
    assert.equal(manifest.icons.length, icons.length);
    assert.deepEqual(manifest.weights, ["regular", "bold"]);
    for (const entry of manifest.icons) {
      assert.deepEqual(entry.weights, weightsOf(entry.slug));
      for (const weight of weightsOf(entry.slug)) {
        for (const master of ICON_MASTERS) {
          const fileName = getMasterFileName(master, weight);
          assert.equal(entry.svg[fileName.replace(/\.svg$/, "")], `icons/${entry.slug}/${fileName}`);
        }
      }
    }
  });
});

describe("search and categories", () => {
  it("matches name, slug and keywords", () => {
    assert.ok(filterIcons("Wind turbine", "all").some((i) => i.slug === "wind-turbine"));
    assert.ok(filterIcons("heat-pump-air", "all").some((i) => i.slug === "heat-pump-air"));
    assert.deepEqual(
      filterIcons("ashp", "all").map((i) => i.slug),
      ["heat-pump-air"],
    );
    assert.equal(filterIcons("zzz-nothing", "all").length, 0);
    assert.equal(filterIcons("", "all").length, icons.length);
  });

  it("maps Figma categories to site categories", () => {
    const counts = Object.fromEntries(getNonEmptyCategories().map((c) => [c.id, c.count]));
    const expected: Record<string, number> = {};
    for (const icon of icons) expected[icon.category] = (expected[icon.category] ?? 0) + 1;
    assert.deepEqual(counts, expected);
    assert.equal(
      getNonEmptyCategories().reduce((sum, c) => sum + c.count, 0),
      icons.length,
    );
  });

  it("lists non-empty categories in sidebar order and hides empty ones", () => {
    const nonEmpty = getNonEmptyCategories().map((c) => c.id);
    const used = new Set<string>(icons.map((i) => i.category));
    assert.deepEqual(
      nonEmpty,
      CATEGORIES.filter((c) => used.has(c.id)).map((c) => c.id),
    );
    assert.ok(CATEGORIES.some((c) => c.id === "fuels"));
    assert.equal(nonEmpty.includes("fuels"), used.has("fuels"));
  });
});

describe("framework snippets", () => {
  it("offers a snippet for each install path, including the slug and size", () => {
    assert.deepEqual(
      FRAMEWORKS.map((framework) => framework.label),
      ["React", "One icon", "HTML", "CSS", "Inline SVG"],
    );
    for (const framework of FRAMEWORKS) {
      const snippet = getIconSnippet(framework.id, "wind-turbine", 24);
      assert.match(snippet, /wind-turbine|WindTurbine/, framework.id);
      assert.match(snippet, /24/, framework.id);
    }
    assert.match(getIconSnippet("react", "pylon", 40), /energy-icons\/icon/);
    assert.match(getIconSnippet("one", "heat-pump-air", 16), /import \{ HeatPumpAir \} from "energy-icons\/icons\/heat-pump-air"/);
    // No-install snippets load the master that matches the size from the npm package on jsDelivr.
    assert.match(getIconSnippet("html", "solar-panel", 16), /src="https:\/\/cdn\.jsdelivr\.net\/npm\/energy-icons@1\/svg\/solar-panel\/20\.svg"/);
    assert.match(getIconSnippet("html", "solar-panel", 32), /\/solar-panel\/48\.svg"/);
    assert.match(getIconSnippet("css", "pylon", 24), /background-color: currentColor;[\s\S]*mask: url\("[^"]+\/pylon\/20\.svg"\)/);
    assert.match(getIconSnippet("inline", "pylon", 24, "regular", "<svg>…</svg>"), /<svg>…<\/svg>/);
  });

  it("adds the weight to every snippet when Bold is selected, and omits it for Regular", () => {
    for (const framework of FRAMEWORKS) {
      assert.equal(getIconSnippet(framework.id, "pylon", 24), getIconSnippet(framework.id, "pylon", 24, "regular"));
      assert.doesNotMatch(getIconSnippet(framework.id, "pylon", 24), /bold/i, framework.id);
      assert.match(getIconSnippet(framework.id, "pylon", 24, "bold"), /bold/i, framework.id);
    }
    assert.match(getIconSnippet("react", "pylon", 40, "bold"), /<Icon name="pylon" size=\{40\} weight="bold" \/>/);
    assert.match(getIconSnippet("one", "pylon", 40, "bold"), /<Pylon size=\{40\} weight="bold" \/>/);
    assert.match(getIconSnippet("html", "solar-panel", 32, "bold"), /\/solar-panel\/48-bold\.svg"/);
  });
});
