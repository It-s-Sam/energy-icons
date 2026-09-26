"use client";

import { useRef, useState } from "react";

import { IconDetailDialog } from "@/components/library/icon-detail-dialog";
import { IconGrid } from "@/components/library/icon-grid";
import { useLibrary } from "@/components/library/library-provider";
import { Toolbar } from "@/components/library/toolbar";
import { SearchGlyph } from "@/components/ui/ui-icons";
import { CATEGORY_LABELS } from "@/data/categories";
import type { IconName } from "@/data/icons";
import { filterIcons, TOTAL_ICONS, type CategoryFilter } from "@/lib/icons/filter";
import Link from "next/link";

export function IconBrowser({ category }: { category: CategoryFilter }) {
  const { query, setQuery, size, showNames, setShowNames } = useLibrary();
  const [selected, setSelected] = useState<IconName | null>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const results = filterIcons(query, category);

  const open = (name: IconName) => {
    lastTrigger.current = document.activeElement as HTMLElement | null;
    setSelected(name);
  };

  const close = () => {
    setSelected(null);
    // Return focus to the icon that opened the dialog.
    requestAnimationFrame(() => lastTrigger.current?.focus());
  };

  const heading = category === "all" ? "All icons" : CATEGORY_LABELS[category];

  return (
    <>
      <Toolbar resultCount={results.length} totalCount={TOTAL_ICONS} />

      <main className="min-h-0 flex-1 overflow-y-auto">
        <h1 className="sr-only">{heading}</h1>
        <div className="px-4 py-4 lg:px-6">
          {results.length > 0 ? (
            <IconGrid icons={results} size={size} showNames={showNames} selected={selected} onSelect={open} />
          ) : (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center" data-testid="empty-state">
              <div className="grid size-10 place-items-center rounded-full border border-line text-fg-subtle">
                <SearchGlyph />
              </div>
              <div>
                <p className="text-[13px] font-medium text-fg">No icons match “{query}”</p>
                <p className="mt-1 text-[12px] text-fg-muted">
                  Try another name or tag{category !== "all" ? ", or search every category" : ""}.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="h-7 rounded-md border border-line px-2.5 text-[12px] text-fg hover:bg-hover"
                >
                  Clear search
                </button>
                {category !== "all" && (
                  <Link href="/" className="h-7 rounded-md px-2.5 text-[12px] leading-7 text-accent hover:bg-accent-softer">
                    Search all icons
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="flex h-11 shrink-0 items-center justify-center gap-6 border-t border-line px-4">
        <label className="flex cursor-pointer items-center gap-2 text-[12px] text-fg-muted select-none hover:text-fg">
          <input
            type="checkbox"
            checked={showNames}
            onChange={(event) => setShowNames(event.target.checked)}
            className="size-3.5 cursor-pointer rounded-[3px] accent-[#006FFF]"
          />
          Names
        </label>
      </footer>

      {selected && <IconDetailDialog key={selected} name={selected} initialSize={size} onClose={close} />}
    </>
  );
}
