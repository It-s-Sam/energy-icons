"use client";

import type { CSSProperties } from "react";

import { Icon } from "@/components/icon";
import type { IconSize } from "@/config/icons";
import type { IconName } from "@/data/icons";
import type { IconEntry } from "@/lib/icons/filter";

interface IconGridProps {
  icons: IconEntry[];
  size: IconSize;
  showNames: boolean;
  selected: IconName | null;
  onSelect: (name: IconName) => void;
}

export function IconGrid({ icons, size, showNames, selected, onSelect }: IconGridProps) {
  // Cells grow with the icon so spacing stays even at every size.
  const cell = showNames ? Math.max(104, size + 64) : Math.max(64, size + 36);

  return (
    <ul
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${cell}px, 1fr))` } as CSSProperties}
      aria-label="Icons"
    >
      {icons.map((icon) => {
        const isSelected = selected === icon.slug;
        return (
          <li key={icon.slug}>
            <button
              type="button"
              onClick={() => onSelect(icon.slug)}
              data-slug={icon.slug}
              aria-label={showNames ? undefined : icon.name}
              aria-haspopup="dialog"
              className={`group flex w-full flex-col items-center rounded-lg px-2 transition-colors ${
                showNames ? "gap-2.5 pt-5 pb-3" : "py-4"
              } ${
                isSelected
                  ? "bg-accent-soft text-accent shadow-[inset_0_0_0_1px_var(--accent-ring)]"
                  : "text-fg hover:bg-accent-softer hover:text-accent"
              }`}
              title={showNames ? undefined : icon.name}
            >
              <span className="grid place-items-center" style={{ height: Math.max(size, 20) }}>
                <Icon name={icon.slug} size={size} />
              </span>
              {showNames && (
                <span
                  className={`line-clamp-2 min-h-[2lh] text-center text-[11px] leading-[1.35] ${
                    isSelected ? "text-accent" : "text-fg-muted group-hover:text-fg"
                  }`}
                >
                  {icon.name}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
