"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import { MenuButton } from "@/components/layout/menu-button";
import { ThemeToggle } from "@/components/layout/theme";
import { useLibrary } from "@/components/library/library-provider";
import { DownloadGlyph, SearchGlyph } from "@/components/ui/ui-icons";
import { getMasterForSize, SUPPORTED_SIZES } from "@/config/icons";
import { siteConfig } from "@/config/site";

export function Toolbar({ resultCount, totalCount }: { resultCount: number; totalCount: number }) {
  const { query, setQuery, size, setSize } = useLibrary();
  const searchRef = useRef<HTMLInputElement>(null);
  const index = SUPPORTED_SIZES.indexOf(size);
  const master = getMasterForSize(size);
  const fill = `${(index / (SUPPORTED_SIZES.length - 1)) * 100}%`;

  // "/" focuses search, like most icon browsers.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, select, [contenteditable=true]");
      if (event.key === "/" && !typing && !document.querySelector("dialog[open]")) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="flex min-h-[52px] shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-3 py-2 xl:flex-nowrap xl:py-0">
      <div className="flex min-w-[220px] flex-1 items-center gap-1">
        <MenuButton />
        <label className="group relative flex h-8 flex-1 items-center">
          <span className="sr-only">Search icons</span>
          <SearchGlyph className="pointer-events-none absolute left-2 text-fg-subtle" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setQuery("");
            }}
            placeholder="Search icons by name or tag…"
            title="Search (press / to focus)"
            className="h-8 w-full rounded-md bg-transparent pr-3 pl-8 text-[13px] text-fg outline-none placeholder:text-fg-subtle hover:bg-hover focus:bg-surface focus:shadow-[0_0_0_1px_var(--accent-ring),0_0_0_3px_var(--accent-soft)] [&::-webkit-search-cancel-button]:hidden"
          />
        </label>
      </div>

      <div className="order-3 flex w-full items-center gap-4 pl-10 xl:order-2 xl:w-auto xl:pl-0">
        <div className="h-4 w-px bg-line max-xl:hidden" aria-hidden="true" />
        <div className="flex items-center gap-3">
          <input
            type="range"
            className="size-slider w-40"
            min={0}
            max={SUPPORTED_SIZES.length - 1}
            step={1}
            value={index}
            onChange={(event) => setSize(SUPPORTED_SIZES[Number(event.target.value)])}
            aria-label="Icon size"
            aria-valuetext={`${size} pixels, ${master} master`}
            style={{ "--fill": fill } as CSSProperties}
          />
          <div className="flex items-baseline gap-1">
            <output
              aria-live="polite"
              className="grid h-6 min-w-9 place-items-center rounded-md border border-line bg-surface px-1.5 text-[12px] font-medium tabular-nums text-fg"
            >
              {size}
            </output>
            <span className="text-[12px] text-fg-subtle">px</span>
          </div>
        </div>
        <span
          className="inline-flex h-6 items-center gap-1.5 rounded-full border border-line px-2 text-[11px] font-medium whitespace-nowrap text-fg-muted"
          title={`Sizes ${master === 20 ? "below" : "from"} 32px use the ${master}×${master} master`}
          data-testid="master-indicator"
        >
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
          {master} master
        </span>
      </div>

      <div className="order-2 ml-auto flex items-center gap-2 xl:order-3">
        <span className="px-1 text-[12px] whitespace-nowrap text-fg-subtle tabular-nums" aria-live="polite" data-testid="result-count">
          {resultCount} / {totalCount}
        </span>
        <ThemeToggle />
        <a
          href={siteConfig.downloadAllHref}
          download="wild-icons.zip"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-[12px] font-medium whitespace-nowrap text-primary-fg transition-colors hover:bg-primary-hover"
        >
          <DownloadGlyph size={14} />
          Download all
        </a>
      </div>
    </header>
  );
}
