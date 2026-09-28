/**
 * Pure string helpers for working with the master SVG files.
 * Shared by the registry generator (Node) and the UI (browser), so copy /
 * download output is produced exactly the same way everywhere.
 *
 * Only the root <svg> tag is ever touched. Everything after it (paths, fills,
 * rules) is passed through byte-for-byte.
 */

import type { IconMasterSource } from "./types";

const ROOT_TAG = /<svg\b[^>]*>/;

export interface ParsedSvg {
  /** The root opening tag, e.g. `<svg width="20" ... >` */
  rootTag: string;
  /** Attributes of the root tag */
  attributes: Record<string, string>;
  /** Exact markup between the root opening tag and `</svg>` */
  body: string;
  /** Index in the source where `body` starts */
  bodyStart: number;
}

export function parseSvg(source: string): ParsedSvg {
  const match = ROOT_TAG.exec(source);
  if (!match) throw new Error("No <svg> root element found");
  const bodyStart = match.index + match[0].length;
  const bodyEnd = source.lastIndexOf("</svg>");
  if (bodyEnd < bodyStart) throw new Error("Missing closing </svg>");

  const attributes: Record<string, string> = {};
  for (const [, key, value] of match[0].matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)="([^"]*)"/g)) {
    attributes[key] = value;
  }

  return { rootTag: match[0], attributes, body: source.slice(bodyStart, bodyEnd), bodyStart };
}

function setAttribute(tag: string, name: string, value: string): string {
  const attr = new RegExp(`(\\s${name}=")[^"]*(")`);
  if (attr.test(tag)) return tag.replace(attr, `$1${value}$2`);
  return tag.replace(/^<svg\b/, `<svg ${name}="${value}"`);
}

/**
 * Return the master SVG source with width/height set to `size`.
 * viewBox and all child markup are left untouched, so the drawing scales
 * proportionally and path data stays byte-identical to the source file.
 */
export function withSize(source: string, size: number): string {
  const { rootTag, bodyStart } = parseSvg(source);
  const start = bodyStart - rootTag.length;
  const sized = setAttribute(setAttribute(rootTag, "width", String(size)), "height", String(size));
  return source.slice(0, start) + sized + source.slice(bodyStart);
}

/** Extract every `d="…"` attribute value, in document order. */
export function extractPathData(svg: string): string[] {
  return [...svg.matchAll(/\sd="([^"]*)"/g)].map((m) => m[1]);
}

/**
 * Registry entry for one master. The generated files store the source SVG
 * once; viewBox and inner markup are sliced from it here so path data is not
 * duplicated in the bundle.
 */
export function toMasterSource(svg: string): IconMasterSource {
  const { attributes, body } = parseSvg(svg);
  return { viewBox: attributes.viewBox ?? "", body, svg };
}
