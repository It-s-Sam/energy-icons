"use client";

import { useEffect } from "react";

import { linkEvent, track } from "@/lib/analytics";

/**
 * One delegated listener for GitHub, Figma, icon-request and Download all clicks,
 * so every link to them is counted wherever it appears, docs included.
 */
export function LinkTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const name = linkEvent(anchor.href);
      if (name) track(name, { link_url: anchor.href, page_path: location.pathname });
    };
    // Capture phase, so handlers that stop propagation can't hide the click.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
