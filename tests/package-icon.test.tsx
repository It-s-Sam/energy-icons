import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { createIcon } from "../packages/energy-icons/src/create-icon";

const square = (viewBox: string) => ({ viewBox, body: `<path d="M1 1h2v2H1z"/>` });

const Sample = createIcon("sample", {
  regular: { 20: square("0 0 20 20"), 48: square("0 0 48 48") },
  bold: { 20: square("0 0 20 20"), 48: { viewBox: "0 0 48 48", body: `<path d="M2 2h4v4H2z"/>` } },
});

describe("energy-icons createIcon", () => {
  it("uses the 48 master from 32px and the 20 master below it", () => {
    const large = renderToStaticMarkup(<Sample size={32} />);
    const small = renderToStaticMarkup(<Sample size={24} />);
    assert.equal(large.includes('viewBox="0 0 48 48"'), true);
    assert.equal(small.includes('viewBox="0 0 20 20"'), true);
    assert.equal(large.includes('width="32"'), true);
    assert.equal(large.includes('data-weight="regular"'), true);
  });

  it("renders Bold artwork when the icon has it", () => {
    const html = renderToStaticMarkup(<Sample size={40} weight="bold" />);
    assert.equal(html.includes("M2 2h4v4H2z"), true);
    assert.equal(html.includes('data-weight="bold"'), true);
  });

  it("falls back to Regular when Bold artwork is missing", () => {
    const RegularOnly = createIcon("plain", { regular: { 20: square("0 0 20 20"), 48: square("0 0 48 48") } });
    const html = renderToStaticMarkup(<RegularOnly weight="bold" />);
    assert.equal(html.includes('data-weight="regular"'), true);
    assert.equal(html.includes("M1 1h2v2H1z"), true);
  });
});
