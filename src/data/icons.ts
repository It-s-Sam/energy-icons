import type { CategoryId } from "./categories";

/**
 * Icon metadata — one entry per folder in /icons/<slug>/.
 *
 * To add an icon: drop 20.svg and 48.svg into /icons/<slug>/ and add an entry
 * here. The order of this list is the display order in the library.
 * `npm run icons` (run automatically before dev/build/test/typecheck)
 * validates that metadata and folders match one-to-one.
 */
export interface IconMeta {
  /** kebab-case, must match the folder name in /icons */
  slug: string;
  /** Human-readable name shown under the icon */
  name: string;
  category: CategoryId;
  /** Search terms (synonyms, acronyms, related concepts) */
  keywords: readonly string[];
}

export const icons = [
  {
    slug: "house-solar",
    name: "House solar",
    category: "generation",
    keywords: ["rooftop solar", "home", "house", "solar panels", "residential", "PV"],
  },
  {
    slug: "solar-array-sun",
    name: "Solar array sun",
    category: "generation",
    keywords: ["solar array", "sun", "photovoltaic", "PV", "solar power", "renewable"],
  },
  {
    slug: "solar-farm",
    name: "Solar farm",
    category: "generation",
    keywords: ["solar farm", "utility-scale", "solar park", "sun", "photovoltaic", "generation"],
  },
  {
    slug: "solar-panel",
    name: "Solar panel",
    category: "generation",
    keywords: ["solar panel", "photovoltaic", "PV", "module", "solar power"],
  },
  {
    slug: "solar-panel-sun",
    name: "Solar panel sun",
    category: "generation",
    keywords: ["solar panel", "sun", "solar energy", "photovoltaic", "clean energy"],
  },
  {
    slug: "wind-turbine",
    name: "Wind turbine",
    category: "generation",
    keywords: ["wind turbine", "onshore wind", "wind power", "renewable", "generation"],
  },
  {
    slug: "wind-turbine-offshore",
    name: "Wind turbine offshore",
    category: "generation",
    keywords: ["offshore wind", "wind turbine", "sea", "marine", "wind farm", "generation"],
  },
  {
    slug: "wind-turbine-offshore-spinning",
    name: "Wind turbine offshore spinning",
    category: "generation",
    keywords: ["offshore wind", "spinning", "rotating", "wind turbine", "active", "generation"],
  },
  {
    slug: "hydro-turbine",
    name: "Hydro turbine",
    category: "generation",
    keywords: ["hydropower", "hydroelectric", "water turbine", "dam", "run-of-river", "generation"],
  },
  {
    slug: "battery-charging",
    name: "Battery charging",
    category: "grid-storage",
    keywords: ["battery", "charging", "energy storage", "charge", "power bank"],
  },
  {
    slug: "battery-storage",
    name: "Battery storage",
    category: "grid-storage",
    keywords: ["battery storage", "BESS", "grid storage", "energy storage", "home battery"],
  },
  {
    slug: "ev-charger",
    name: "EV charger",
    category: "grid-storage",
    keywords: ["EV charger", "charging point", "electric vehicle", "chargepoint", "public charging", "e-mobility"],
  },
  {
    slug: "ev-charger-home",
    name: "EV charger home",
    category: "grid-storage",
    keywords: ["home charger", "EV charging", "wallbox", "electric vehicle", "plug", "residential"],
  },
  {
    slug: "power-station",
    name: "Power station",
    category: "grid-storage",
    keywords: ["power station", "power plant", "cooling tower", "generation", "thermal", "grid"],
  },
  {
    slug: "pylon",
    name: "Pylon",
    category: "grid-storage",
    keywords: ["pylon", "transmission tower", "power lines", "electricity grid", "transmission", "network"],
  },
  {
    slug: "heat-pump-air",
    name: "Heat pump air",
    category: "heat-buildings",
    keywords: ["heat pump", "air source", "ASHP", "heating", "HVAC", "electrification"],
  },
  {
    slug: "heat-pump-ground",
    name: "Heat pump ground",
    category: "heat-buildings",
    keywords: ["heat pump", "ground source", "GSHP", "geothermal", "heating", "electrification"],
  },
  {
    slug: "factory",
    name: "Factory",
    category: "climate",
    keywords: ["factory", "industry", "manufacturing", "plant", "industrial", "decarbonisation"],
  },
  {
    slug: "factory-emissions",
    name: "Factory emissions",
    category: "climate",
    keywords: ["factory emissions", "pollution", "CO2", "carbon", "smokestack", "climate"],
  },
] as const satisfies readonly IconMeta[];

/** Union of every known icon slug, e.g. "wind-turbine". */
export type IconName = (typeof icons)[number]["slug"];

export const ICON_NAMES: readonly IconName[] = icons.map((icon) => icon.slug);

export function getIconMeta(name: IconName): IconMeta {
  const meta = icons.find((icon) => icon.slug === name);
  if (!meta) throw new Error(`Unknown icon "${name}"`);
  return meta;
}

export function isIconName(value: string): value is IconName {
  return (ICON_NAMES as readonly string[]).includes(value);
}
