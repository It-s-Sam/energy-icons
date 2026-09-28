import { createElement, type ReactElement } from "react";

import type { IconArtwork } from "./artwork.js";
import type { IconComponentProps, IconMaster } from "./types.js";

const OPTICAL_MASTER_BREAKPOINT = 32;

const escapeText = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const masterFor = (size: number): IconMaster => (size < OPTICAL_MASTER_BREAKPOINT ? 20 : 48);

/** Build one icon component from its master artwork. Path data is rendered as supplied. */
export function createIcon(name: string, artwork: IconArtwork) {
  const Icon = ({ size = 32, weight = "regular", title, ...props }: IconComponentProps): ReactElement => {
    const rendered = weight === "bold" && artwork.bold ? "bold" : "regular";
    const master = masterFor(size);
    const source = (rendered === "bold" ? artwork.bold! : artwork.regular)[master];
    const labelled = Boolean(title || props["aria-label"] || props["aria-labelledby"]);
    const html = title ? `<title>${escapeText(title)}</title>${source.body}` : source.body;

    return createElement("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "currentColor",
      "data-icon": name,
      "data-master": master,
      "data-weight": rendered,
      ...(labelled ? { role: "img", "aria-label": title } : { "aria-hidden": true, focusable: "false" }),
      ...props,
      viewBox: source.viewBox,
      width: size,
      height: size,
      dangerouslySetInnerHTML: { __html: html },
    });
  };

  Icon.displayName = name;
  return Icon;
}
