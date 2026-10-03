import { siteConfig } from "@/config/site";

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params?: Record<string, unknown>) => void;
  }
}

/** Send a Google Analytics event. Does nothing if gtag is blocked or not loaded. */
export function track(name: string, params?: Record<string, unknown>): void {
  try {
    window.gtag?.("event", name, params);
  } catch {
    /* analytics must never break the page */
  }
}

/** Name the event for a link click, or null when the link isn't one we count. */
export function linkEvent(href: string): string | null {
  if (href.includes("/issues/new")) return "icon_request_click";
  if (href.endsWith(siteConfig.downloadAllHref)) return "download_all";
  if (href.startsWith("https://www.figma.com/")) return "figma_click";
  if (href.startsWith("https://github.com/")) return "github_click";
  if (href.startsWith(siteConfig.links.author.href)) return "author_click";
  return null;
}
