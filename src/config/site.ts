/**
 * Site-level configuration. Links left `undefined` are simply not rendered;
 * fill them in to surface GitHub / Figma / sponsor slots in the sidebar.
 */
export interface SiteLink {
  label: string;
  href: string;
}

/**
 * The public origin, used for canonical and social-preview URLs. Set
 * NEXT_PUBLIC_SITE_URL once a custom domain is live; until then Vercel's own
 * production domain is used, and local builds fall back to localhost.
 */
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export const siteConfig = {
  name: "Energy Icons",
  version: "1.1",
  url: resolveSiteUrl(),
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
