import type { SVGProps } from "react";

import type { IconMaster, IconWeight } from "@/config/icons";
import type { IconName } from "@/data/icons";

type SvgAttributes = Omit<
  SVGProps<SVGSVGElement>,
  "name" | "width" | "height" | "viewBox" | "children" | "dangerouslySetInnerHTML"
>;

export interface IconSvgProps extends SvgAttributes {
  name: IconName;
  master: IconMaster;
  size: number;
  weight: IconWeight;
  viewBox: string;
  /** Inner markup, paths untouched. */
  body: string;
  title?: string;
}

const escapeText = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Presentational icon. Callers supply the master markup; this file does not load artwork. */
export function IconSvg({ name, master, size, weight, viewBox, body, title, ...props }: IconSvgProps) {
  const labelled = Boolean(title || props["aria-label"] || props["aria-labelledby"]);
  const html = title ? `<title>${escapeText(title)}</title>${body}` : body;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill="currentColor"
      data-icon={name}
      data-master={master}
      data-weight={weight}
      {...(labelled ? { role: "img", "aria-label": title } : { "aria-hidden": true, focusable: "false" })}
      {...props}
      width={size}
      height={size}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
