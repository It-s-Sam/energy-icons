import {
  DEFAULT_ICON_SIZE,
  DEFAULT_ICON_WEIGHT,
  getMasterForSize,
  type IconMaster,
  type IconSize,
  type IconWeight,
} from "@/config/icons";
import type { IconName } from "@/data/icons";
import { getIconSource } from "@/lib/icons";
import { resolveWeight } from "@/lib/icons/weight";
import { IconSvg, type IconSvgProps } from "@/components/icon-svg";

type SvgAttributes = Omit<IconSvgProps, "name" | "master" | "size" | "weight" | "viewBox" | "body">;

export interface IconProps extends SvgAttributes {
  /** Icon slug, e.g. "wind-turbine" */
  name: IconName;
  /**
   * Rendered size in px. Supported sizes: 12, 14, 16, 18, 20, 24, 28, 32, 40,
   * 48, 64. The 20 or 48 master is chosen via OPTICAL_MASTER_BREAKPOINT.
   */
  size?: IconSize | (number & {});
  /**
   * "regular" (default) or "bold". Bold uses its own 20/48 masters, picked by
   * the same breakpoint. Icons without Bold masters render Regular.
   */
  weight?: IconWeight;
  /** Accessible label. Without it (or aria-label) the icon is decorative. */
  title?: string;
}

export interface IconMasterSvgProps extends Omit<IconProps, "size"> {
  /** Force a specific master (used by the detail view's magnified preview). */
  master: IconMaster;
  size: number;
}

/** Render one specific master at `size`. Prefer <Icon> in app code. */
export function IconMasterSvg({ name, master, size, weight = DEFAULT_ICON_WEIGHT, title, ...props }: IconMasterSvgProps) {
  const rendered = resolveWeight(name, weight);
  const source = getIconSource(name, master, rendered);
  return <IconSvg name={name} master={master} size={size} weight={rendered} title={title} viewBox={source.viewBox} body={source.body} {...props} />;
}

/**
 * Inline SVG icon that inherits `currentColor`.
 *
 *   <Icon name="wind-turbine" size={24} />
 *   <Icon name="wind-turbine" size={24} weight="bold" />
 *
 * Picks the 20 master below OPTICAL_MASTER_BREAKPOINT (32px) and the 48 master
 * from it upwards (for either weight), then scales via width/height only. Path data and strokes
 * are never modified.
 *
 * This loads every master. The icon browser uses BrowserIcon instead, which
 * fetches one weight and master at a time.
 */
export function Icon({ size = DEFAULT_ICON_SIZE, ...props }: IconProps) {
  return <IconMasterSvg {...props} master={getMasterForSize(size)} size={size} />;
}
