/**
 * Site-level configuration. Links left `undefined` are simply not rendered;
 * fill them in to surface GitHub / Figma / sponsor slots in the sidebar.
 */
export interface SiteLink {
  label: string;
  href: string;
}

/**
 * The public origin, used for canonical and social-preview URLs, the sitemap and
 * robots.txt. NEXT_PUBLIC_SITE_URL overrides it (for example on a staging domain).
 */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://energyicons.com").replace(/\/$/, "");

export const siteConfig = {
  name: "Energy Icons",
  version: "1.1",
  url: SITE_URL,
  description:
    "Open-source icon library for the renewable energy and energy-transition sector. Two optical masters, scaled — never redrawn.",
  /** Static download produced at build time by scripts/generate-icons.ts */
  downloadAllHref: "/downloads/energy-icons.zip",
  links: {
    github: { label: "GitHub", href: "https://github.com/Sam-r-passmore/energy-icons" } as SiteLink | undefined,
    /** Recurring support. Icons stay free. */
    sponsor: { label: "Sponsor", href: "https://github.com/sponsors/Sam-r-passmore" } as SiteLink | undefined,
    /** One-off support. Set this when a Buy Me a Coffee page exists. */
    coffee: undefined as SiteLink | undefined,
    figma: { label: "Figma plugin", href: "https://www.figma.com/community/plugin/1687188347733136771/energy-icons" } as SiteLink | undefined,
  },
};
