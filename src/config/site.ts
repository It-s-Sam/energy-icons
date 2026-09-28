/**
 * Site-level configuration. Links left `undefined` are simply not rendered;
 * fill them in to surface GitHub / Figma / sponsor slots in the sidebar.
 */
export interface SiteLink {
  label: string;
  href: string;
}

export const siteConfig = {
  name: "Energy Icons",
  version: "1.0",
  description:
    "Open-source icon library for the renewable energy and energy-transition sector. Two optical masters, scaled — never redrawn.",
  /** Static download produced at build time by scripts/generate-icons.ts */
  downloadAllHref: "/downloads/energy-icons.zip",
  links: {
    github: { label: "GitHub", href: "https://github.com/It-s-Sam/energy-icons" } as SiteLink | undefined,
    /** Recurring support. Icons stay free. */
    sponsor: { label: "Sponsor", href: "https://github.com/sponsors/It-s-Sam" } as SiteLink | undefined,
    /** One-off support. Set this when a Buy Me a Coffee page exists. */
    coffee: undefined as SiteLink | undefined,
    figma: undefined as SiteLink | undefined,
  },
};
