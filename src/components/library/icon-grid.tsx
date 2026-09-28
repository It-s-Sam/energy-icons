"use client";

import { useEffect, useState, type CSSProperties } from "react";

import { BrowserIcon } from "@/components/library/browser-icon";
import { getMasterForSize, type IconSize, type IconWeight } from "@/config/icons";
import type { IconName } from "@/data/icons";
import { loadMaster, peekMaster } from "@/lib/icons/browser-masters";
import type { IconEntry } from "@/lib/icons/filter";

interface IconGridProps {
  icons: IconEntry[];
  size: IconSize;
  weight: IconWeight;
  selected: IconName | null;
  onSelect: (name: IconName) => void;
}

export function IconGrid({ icons, size, weight, selected, onSelect }: IconGridProps) {
  const master = getMasterForSize(size);
  const [held, setHeld] = useState({ size, weight });

  useEffect(() => {
    if (peekMaster(weight, master)) return;
    let live = true;
    loadMaster(weight, master).then(() => {
      if (live) setHeld({ size, weight });
    });
    return () => {
      live = false;
    };
  }, [size, weight, master]);

  // Keep the previous drawing on screen until the chunk for this size arrives.
  const display = peekMaster(weight, master) ? { size, weight } : held;
  const displayMaster = getMasterForSize(display.size);
  const canDraw = peekMaster(display.weight, displayMaster) !== undefined;
  const cell = Math.max(64, display.size + 36);

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
              aria-label={icon.name}
              aria-haspopup="dialog"
              className={`flex w-full flex-col items-center rounded-lg px-2 py-4 text-fg transition-colors ${
                isSelected ? "bg-hover shadow-[inset_0_0_0_1px_var(--line-strong)]" : "hover:bg-hover"
              }`}
              title={icon.name}
            >
              <span className="grid place-items-center" style={{ height: Math.max(display.size, 20) }}>
                {canDraw && <BrowserIcon name={icon.slug} size={display.size} weight={display.weight} />}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
