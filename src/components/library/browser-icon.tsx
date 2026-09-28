"use client";

import { DEFAULT_ICON_WEIGHT, getMasterForSize, type IconMaster, type IconWeight } from "@/config/icons";
import type { IconName } from "@/data/icons";
import { getBrowserSource } from "@/lib/icons/browser-masters";
import { resolveWeight } from "@/lib/icons/weight";
import { IconSvg, type IconSvgProps } from "@/components/icon-svg";

type SvgAttributes = Omit<IconSvgProps, "name" | "master" | "size" | "weight" | "viewBox" | "body">;

interface BrowserIconProps extends SvgAttributes {
  name: IconName;
  size: number;
  weight?: IconWeight;
  /** Force a specific master. Defaults to the master for `size`. */
  master?: IconMaster;
  title?: string;
}

/**
 * Grid and dialog icon. The matching weight+master chunk must already be
 * loaded (`loadMaster`); otherwise this throws.
 */
export function BrowserIcon({ name, size, weight = DEFAULT_ICON_WEIGHT, master, title, ...props }: BrowserIconProps) {
  const resolvedMaster = master ?? getMasterForSize(size);
  const rendered = resolveWeight(name, weight);
  const source = getBrowserSource(name, resolvedMaster, rendered);
  return (
    <IconSvg
      name={name}
      master={resolvedMaster}
      size={size}
      weight={rendered}
      title={title}
      viewBox={source.viewBox}
      body={source.body}
      {...props}
    />
  );
}
