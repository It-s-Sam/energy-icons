/**
 * Site-level configuration. Links left `undefined` are simply not rendered;
 * fill them in to surface GitHub / Figma / sponsor slots in the sidebar.
 */
export interface SiteLink {
  label: string;
  href: string;
}

export const siteConfig = {
  name: "Wild Icons",
  version: "0.1",
  description:
    "Open-source icon library for the renewable energy and energy-transition sector. Two optical masters, scaled — never redrawn.",
  /** Static download produced at build time by scripts/generate-icons.ts */
  downloadAllHref: "/downloads/wild-icons.zip",
  links: {
    github: undefined as SiteLink | undefined,
    figma: undefined as SiteLink | undefined,
    sponsor: undefined as SiteLink | undefined,
  },
};
