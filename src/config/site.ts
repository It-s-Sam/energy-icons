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
  version: "1.1.1",
  url: SITE_URL,
  description:
    "Open-source icon library for the renewable energy and energy-transition sector. Two optical masters, scaled — never redrawn.",
  /** Static download produced at build time by scripts/generate-icons.ts */
  downloadAllHref: "/downloads/energy-icons.zip",
  links: {
    github: { label: "GitHub", href: "https://github.com/Sam-r-passmore/energy-icons" } as SiteLink | undefined,
    /** Recurring support. Icons stay free. */
    // Ko-fi while the GitHub Sponsors profile (github.com/sponsors/Sam-r-passmore) awaits approval.
    sponsor: { label: "Sponsor", href: "https://ko-fi.com/energyicons" } as SiteLink | undefined,
    /** One-off support. Set this when a Buy Me a Coffee page exists. */
    coffee: undefined as SiteLink | undefined,
    /** Opens the GitHub icon-request issue form. */
    requestIcon: { label: "Request an icon", href: "https://github.com/Sam-r-passmore/energy-icons/issues/new?template=icon_request.yml" },
    /** Credited in the sidebar footer and page metadata. */
    author: { label: "Sam Passmore", href: "https://itssam.io" },
    figma: { label: "Figma plugin", href: "https://www.figma.com/community/plugin/1687188347733136771/energy-icons" } as SiteLink | undefined,
  },
};

/** The icon-request form, with the title pre-filled when we know what was searched for. */
export function requestIconHref(name?: string): string {
  const href = siteConfig.links.requestIcon.href;
  return name ? `${href}&title=${encodeURIComponent(`Icon request: ${name}`)}` : href;
}
