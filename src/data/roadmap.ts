import type { IconName } from "@/data/icons";

/**
 * The public roadmap (/roadmap), drawn as a power line: shipped milestones are
 * lit, the current one pulses, later ones wait to be powered. Edit this list to
 * update the page; order is left to right (top to bottom on phones).
 */
export type RoadmapStatus = "shipped" | "now" | "next" | "later" | "exploring";

export type RoadmapMilestone = {
  id: string;
  status: RoadmapStatus;
  /** Rough timing, e.g. "Sep 2026" or "Winter 2026". */
  when: string;
  icon: IconName;
  title: string;
  summary: string;
  items: readonly string[];
};

export const ROADMAP_STATUS_LABELS: Record<RoadmapStatus, string> = {
  shipped: "Shipped",
  now: "In progress",
  next: "Next",
  later: "Later",
  exploring: "Exploring",
};

export const ROADMAP: readonly RoadmapMilestone[] = [
  {
    id: "launch",
    status: "shipped",
    when: "Sep 2026",
    icon: "rocket",
    title: "1.0 launch",
    summary: "The first public release: hand-drawn icons in two optical sizes and two weights.",
    items: ["638 icons, Regular and Bold", "energy-icons for React", "The library website"],
  },
  {
    id: "thousand",
    status: "shipped",
    when: "Sep 2026",
    icon: "sparkles",
    title: "1,000 icons",
    summary: "362 new icons, redrawn masters, and ways to use the set with no install at all.",
    items: ["Version 1.1 on npm", "HTML, CSS and inline SVG snippets", "License & legal page"],
  },
  {
    id: "figma",
    status: "shipped",
    when: "Oct 2026",
    icon: "puzzle",
    title: "Figma plugin",
    summary: "Search, pick a size and weight, then click or drag icons straight onto the canvas.",
    items: ["Live on Figma Community", "Always in sync with the website"],
  },
  {
    id: "essentials",
    status: "next",
    when: "Autumn 2026",
    icon: "layout-grid",
    title: "Everyday essentials",
    summary: "Grow the interface set so Energy Icons can be the only icon set an app needs.",
    items: ["Navigation, media and communication", "Files, commerce and settings", "Same grid and construction rules"],
  },
  {
    id: "fill",
    status: "next",
    when: "Winter 2026",
    icon: "contrast",
    title: "Fill weight",
    summary: "A third weight of solid icons for active states, tab bars and small sizes.",
    items: ["Drawn per master, never auto-filled", "Interface icons first, then energy", 'weight="fill" in every package and the plugin'],
  },
  {
    id: "hydrogen",
    status: "next",
    when: "Early 2027",
    icon: "electrolyser",
    title: "Hydrogen & e-fuels pack",
    summary: "Complete coverage for the hydrogen economy, from production to the pump.",
    items: ["Electrolysers and storage", "Pipelines and refuelling", "Ammonia and e-fuels"],
  },
  {
    id: "grid",
    status: "next",
    when: "Early 2027",
    icon: "substation",
    title: "Grid operations pack",
    summary: "The kit grid operators and network planners reach for every day.",
    items: ["Substations and switchgear", "Transformers and interconnectors", "Control rooms and protection"],
  },
  {
    id: "frameworks",
    status: "next",
    when: "Spring 2027",
    icon: "code",
    title: "Vue & Svelte",
    summary: "First-class packages for more frameworks, built from the same masters.",
    items: ["energy-icons-vue", "energy-icons-svelte", "Same size rule and weights"],
  },
  {
    id: "animated",
    status: "later",
    when: "2027",
    icon: "wind-turbine-offshore-spinning",
    title: "Animated icons & live states",
    summary: "Subtle motion and status states for dashboards: generating, charging, offline, fault.",
    items: ["Spinning turbines, pulsing sun", "State badges for monitoring UIs", "Respects reduced motion"],
  },
  {
    id: "carbon-markets",
    status: "later",
    when: "2027",
    icon: "carbon-capture",
    title: "Carbon & markets packs",
    summary: "Capture, storage and credits, plus the language of energy markets.",
    items: ["Carbon capture and removal", "PPAs, tariffs and flexibility", "Trading and settlement"],
  },
  {
    id: "dataviz",
    status: "later",
    when: "2027",
    icon: "chart-donut",
    title: "Data-visualisation kit",
    summary: "A shared visual standard for energy charts, maps and dashboards.",
    items: ["Accessible fuel-type colour palette", "Map markers for every plant type", "Energy-mix legends"],
  },
  {
    id: "glossary",
    status: "exploring",
    when: "Someday",
    icon: "book-open",
    title: "Energy glossary",
    summary: "A plain-English page for every icon: what it is, related terms, when to use it.",
    items: ["Search that knows the jargon", "BESS, PPA, V2G, curtailment…"],
  },
  {
    id: "tools",
    status: "exploring",
    when: "Someday",
    icon: "energy-flow",
    title: "Diagrams & slides",
    summary: "Tools for the people who explain energy: consultants, analysts and policy teams.",
    items: ["Energy system diagram builder", "PowerPoint and Google Slides add-ons"],
  },
];
