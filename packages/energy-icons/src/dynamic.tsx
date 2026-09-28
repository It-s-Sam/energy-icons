import { icons } from "./registry.js";
import type { IconComponentProps } from "./types.js";

export type IconName = keyof typeof icons;

export interface IconProps extends IconComponentProps {
  /** Icon slug, e.g. "wind-turbine". */
  name: IconName;
}

/**
 * Every icon, chosen by name.
 *
 *   import { Icon } from "energy-icons/icon";
 *   <Icon name="pylon" size={32} weight="bold" />
 *
 * This entry includes the whole library. To ship one drawing, import that
 * icon from "energy-icons/icons/<slug>".
 */
export function Icon({ name, ...props }: IconProps) {
  const Component = icons[name];
  return <Component {...props} />;
}
