"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

import { LIBRARY_ANCHOR, inLibrary } from "@/lib/routes";

type LibraryLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * Links to a page scrolled to its library stage. Next.js skips navigation when
 * the URL (hash included) is unchanged, so a repeat click, such as "View icons"
 * after scrolling back up to the hero, would do nothing. On the current page
 * this scrolls to the stage itself; the page's scroll-behavior keeps it smooth.
 */
export function LibraryLink({ href, onClick, ...props }: LibraryLinkProps) {
  const pathname = usePathname();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || pathname !== href) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const stage = document.getElementById(LIBRARY_ANCHOR);
    if (!stage) return;
    event.preventDefault();
    stage.scrollIntoView({ block: "start" });
    if (window.location.hash !== `#${LIBRARY_ANCHOR}`) history.pushState(null, "", inLibrary(href));
  };

  return <Link href={inLibrary(href)} onClick={handleClick} {...props} />;
}
