import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { Icon } from "../src/components/icon";
import { SUPPORTED_SIZES, getMasterForSize } from "../src/config/icons";
import { icons } from "../src/data/icons";
import { extractPathData, parseSvg } from "../src/lib/icons/svg";
import { REGULAR_ONLY, readSource } from "./helpers";

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

  it("renders Bold from the Bold masters at every size, with the same optical switch", () => {
    for (const icon of icons) {
      const hasBold = !REGULAR_ONLY.includes(icon.slug);
      for (const size of SUPPORTED_SIZES) {
        const master = getMasterForSize(size);
        const html = renderToStaticMarkup(<Icon name={icon.slug} size={size} weight="bold" />);
        const { attributes } = parseSvg(html);
        const source = readSource(icon.slug, master, hasBold ? "bold" : "regular");
        assert.equal(attributes.width, String(size), `${icon.slug}@${size} bold width`);
        assert.equal(attributes.viewBox, `0 0 ${master} ${master}`);
        assert.equal(attributes["data-master"], String(master));
        assert.equal(attributes["data-weight"], hasBold ? "bold" : "regular");
        assert.ok(!/stroke-width|non-scaling-stroke|vector-effect/.test(html));
        assert.ok(html.includes(parseSvg(source).body), "inner markup is verbatim");
        assert.deepEqual(extractPathData(html), extractPathData(source));
      }
    }
  });

  it("defaults to Regular", () => {
    const html = renderToStaticMarkup(<Icon name="pylon" size={24} />);
    assert.equal(parseSvg(html).attributes["data-weight"], "regular");
    assert.equal(html, renderToStaticMarkup(<Icon name="pylon" size={24} weight="regular" />));
  });

  it("defaults to 32px (48 master) and supports titles and className", () => {
    const html = renderToStaticMarkup(<Icon name="pylon" title="Pylon & lines" className="text-red-500" />);
    const { attributes } = parseSvg(html);
    assert.equal(attributes.width, "32");
    assert.equal(attributes["data-master"], "48");
    assert.equal(attributes.role, "img");
    assert.equal(attributes["aria-label"], "Pylon & lines".replace("&", "&amp;"));
    assert.equal(attributes.class, "text-red-500");
    assert.ok(html.includes("<title>Pylon &amp; lines</title>"));
    assert.equal(attributes["aria-hidden"], undefined);
  });
});
