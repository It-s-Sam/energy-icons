import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { Icon } from "../src/components/icon";
import { SUPPORTED_SIZES, getMasterForSize } from "../src/config/icons";
import { icons } from "../src/data/icons";
import { extractPathData, parseSvg } from "../src/lib/icons/svg";
import { readSource } from "./helpers";

describe("<Icon>", () => {
  it("renders every icon at every supported size from the right master, paths untouched", () => {
    for (const icon of icons) {
      for (const size of SUPPORTED_SIZES) {
        const master = getMasterForSize(size);
        const html = renderToStaticMarkup(<Icon name={icon.slug} size={size} />);
        const { attributes } = parseSvg(html);
        assert.equal(attributes.width, String(size), `${icon.slug}@${size} width`);
        assert.equal(attributes.height, String(size));
        assert.equal(attributes.viewBox, `0 0 ${master} ${master}`);
        assert.equal(attributes["data-master"], String(master));
        assert.equal(attributes["aria-hidden"], "true");
        assert.ok(!/stroke-width|non-scaling-stroke|vector-effect/.test(html));
        assert.ok(html.includes(parseSvg(readSource(icon.slug, master)).body), "inner markup is verbatim");
        assert.deepEqual(extractPathData(html), extractPathData(readSource(icon.slug, master)));
      }
    }
  });

  it("defaults to 24px (20 master) and supports titles and className", () => {
    const html = renderToStaticMarkup(<Icon name="pylon" title="Pylon & lines" className="text-red-500" />);
    const { attributes } = parseSvg(html);
    assert.equal(attributes.width, "24");
    assert.equal(attributes["data-master"], "20");
    assert.equal(attributes.role, "img");
    assert.equal(attributes["aria-label"], "Pylon & lines".replace("&", "&amp;"));
    assert.equal(attributes.class, "text-red-500");
    assert.ok(html.includes("<title>Pylon &amp; lines</title>"));
    assert.equal(attributes["aria-hidden"], undefined);
  });
});
