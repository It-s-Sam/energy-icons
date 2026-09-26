import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { unzipSync, strFromU8 } from "fflate";

import {
  ICON_MASTERS,
  OPTICAL_MASTER_BREAKPOINT,
  SUPPORTED_SIZES,
  getMasterForSize,
  snapToSupportedSize,
} from "../src/config/icons";
import { CATEGORIES } from "../src/data/categories";
import { icons } from "../src/data/icons";
import { iconRegistry } from "../src/generated/icon-registry";
import { getIconFileName, getIconSvg } from "../src/lib/icons";
import { filterIcons, getNonEmptyCategories } from "../src/lib/icons/filter";
import { extractPathData, parseSvg, withSize } from "../src/lib/icons/svg";
import { ICONS_DIR, ROOT, iconFolders, readSource } from "./helpers";

describe("config", () => {
  it("uses the 20 master below the breakpoint and the 48 master from it", () => {
    assert.equal(OPTICAL_MASTER_BREAKPOINT, 32);
    const expected: Record<number, 20 | 48> = { 12: 20, 14: 20, 16: 20, 18: 20, 20: 20, 24: 20, 28: 20, 32: 48, 40: 48, 48: 48, 64: 48 };
    assert.deepEqual([...SUPPORTED_SIZES], [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64]);
    for (const size of SUPPORTED_SIZES) assert.equal(getMasterForSize(size), expected[size], `size ${size}`);
    assert.equal(getMasterForSize(31.9), 20);
  });

  it("snaps arbitrary values to supported sizes", () => {
    assert.equal(snapToSupportedSize(25), 24);
    assert.equal(snapToSupportedSize(100), 64);
    assert.equal(snapToSupportedSize(1), 12);
  });
});

describe("data integrity", () => {
  it("has 19 icons with unique slugs", () => {
    assert.equal(icons.length, 19);
    assert.equal(new Set(icons.map((i) => i.slug)).size, icons.length);
  });

  it("every metadata entry has both master files", () => {
    for (const icon of icons) {
      for (const master of ICON_MASTERS) {
        assert.ok(existsSync(path.join(ICONS_DIR, icon.slug, `${master}.svg`)), `${icon.slug}/${master}.svg`);
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
      }
    }
  });
});

describe("copy / download output", () => {
  for (const icon of icons) {
    it(`${icon.slug}: every size uses the right master with byte-identical paths`, () => {
      for (const size of SUPPORTED_SIZES) {
        const master = getMasterForSize(size);
        const source = readSource(icon.slug, master);
        const output = getIconSvg(icon.slug, size);
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
        assert.equal(getIconFileName(icon.slug, size), `${icon.slug}-${size}.svg`);
      }
    });
  }
});

describe("download-all zip", () => {
  it("contains every master byte-for-byte plus a manifest", () => {
    const zip = unzipSync(new Uint8Array(readFileSync(path.join(ROOT, "public/downloads/wild-icons.zip"))));
    for (const icon of icons) {
      for (const master of ICON_MASTERS) {
        const entry = zip[`wild-icons/icons/${icon.slug}/${master}.svg`];
        assert.ok(entry, `${icon.slug}/${master}.svg in zip`);
        assert.equal(strFromU8(entry), readSource(icon.slug, master));
      }
    }
    const manifest = JSON.parse(strFromU8(zip["wild-icons/icons.json"]));
    assert.equal(manifest.icons.length, icons.length);
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
    assert.equal(filterIcons("", "all").length, 19);
  });

  it("maps Figma categories to site categories", () => {
    const counts = Object.fromEntries(getNonEmptyCategories().map((c) => [c.id, c.count]));
    assert.deepEqual(counts, { generation: 9, "grid-storage": 6, "heat-buildings": 2, climate: 2 });
  });

  it("keeps Fuels in the type but hides it while empty", () => {
    assert.ok(CATEGORIES.some((c) => c.id === "fuels"));
    assert.ok(!getNonEmptyCategories().some((c) => c.id === "fuels"));
  });
});
