import type { SVGProps } from "react";

import { DEFAULT_ICON_SIZE, getMasterForSize, type IconMaster, type IconSize } from "@/config/icons";
import type { IconName } from "@/data/icons";
import { iconRegistry } from "@/generated/icon-registry";

type SvgAttributes = Omit<
  SVGProps<SVGSVGElement>,
  "name" | "width" | "height" | "viewBox" | "children" | "dangerouslySetInnerHTML"
>;

export interface IconProps extends SvgAttributes {
  /** Icon slug, e.g. "wind-turbine" */
  name: IconName;
  /**
   * Rendered size in px. Supported sizes: 12, 14, 16, 18, 20, 24, 28, 32, 40,
   * 48, 64. The 20 or 48 master is chosen via OPTICAL_MASTER_BREAKPOINT.
   */
  size?: IconSize | (number & {});
  /** Accessible label. Without it (or aria-label) the icon is decorative. */
  title?: string;
}

export interface IconMasterSvgProps extends Omit<IconProps, "size"> {
  /** Force a specific master (used by the detail view's magnified preview). */
  master: IconMaster;
  size: number;
}

const escapeText = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Render one specific master at `size`. Prefer <Icon> in app code. */
export function IconMasterSvg({ name, master, size, title, ...props }: IconMasterSvgProps) {
  const source = iconRegistry[name][master];
  const labelled = Boolean(title || props["aria-label"] || props["aria-labelledby"]);
  const body = title ? `<title>${escapeText(title)}</title>${source.body}` : source.body;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={source.viewBox}
      fill="currentColor"
      data-icon={name}
      data-master={master}
      {...(labelled ? { role: "img", "aria-label": title } : { "aria-hidden": true, focusable: "false" })}
      {...props}
      width={size}
      height={size}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}

/**
 * Inline SVG icon that inherits `currentColor`.
 *
 *   <Icon name="wind-turbine" size={24} />
 *
 * Picks the 20 master below OPTICAL_MASTER_BREAKPOINT (32px) and the 48 master
 * from it upwards, then scales via width/height only. Path data and strokes
 * are never modified.
 */
export function Icon({ size = DEFAULT_ICON_SIZE, ...props }: IconProps) {
  return <IconMasterSvg {...props} master={getMasterForSize(size)} size={size} />;
}
