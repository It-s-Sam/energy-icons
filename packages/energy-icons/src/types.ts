import type { SVGProps } from "react";

export type IconWeight = "regular" | "bold";
export type IconMaster = 20 | 48;

export interface IconComponentProps extends Omit<SVGProps<SVGSVGElement>, "name" | "children"> {
  /** Rendered size in px. Below 32 uses the 20 master. 32 and up use the 48 master. */
  size?: number;
  /** "regular" (default) or "bold". Icons without Bold artwork render Regular. */
  weight?: IconWeight;
  /** Accessible label. Without it (or aria-label) the icon is decorative. */
  title?: string;
}
