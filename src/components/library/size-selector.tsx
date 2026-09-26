"use client";

import { useRef, type KeyboardEvent } from "react";

import { getMasterForSize, ICON_MASTERS, SUPPORTED_SIZES, type IconSize, getSizesForMaster } from "@/config/icons";

/** Segmented control of every supported size, grouped by the master it uses. */
export function SizeSelector({ value, onChange }: { value: IconSize; onChange: (size: IconSize) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = SUPPORTED_SIZES.indexOf(value);
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = Math.min(index + 1, SUPPORTED_SIZES.length - 1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = Math.max(index - 1, 0);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = SUPPORTED_SIZES.length - 1;
    else return;
    event.preventDefault();
    onChange(SUPPORTED_SIZES[next]);
    refs.current[next]?.focus();
  };

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Preview size"
        onKeyDown={onKeyDown}
        className="flex rounded-lg border border-line bg-bg p-0.5"
      >
        {SUPPORTED_SIZES.map((size, i) => {
          const active = size === value;
          const boundary = i > 0 && getMasterForSize(size) !== getMasterForSize(SUPPORTED_SIZES[i - 1]);
          return (
            <button
              key={size}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(size)}
              className={`relative h-7 flex-1 rounded-md text-[12px] tabular-nums transition-colors focus-visible:z-10 ${
                active ? "bg-accent font-medium text-white shadow-sm" : "text-fg-muted hover:bg-hover hover:text-fg"
              } ${boundary ? "ml-1.5 before:absolute before:top-1.5 before:bottom-1.5 before:-left-1 before:w-px before:bg-line-strong" : ""}`}
            >
              {size}
            </button>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1.5 px-0.5 text-[10.5px] text-fg-subtle" aria-hidden="true">
        {ICON_MASTERS.map((master) => {
          const count = getSizesForMaster(master).length;
          const active = getMasterForSize(value) === master;
          return (
            <div key={master} style={{ flexGrow: count, flexBasis: 0 }} className="flex items-center gap-1.5">
              <span className={`h-px flex-1 ${active ? "bg-accent" : "bg-line"}`} />
              <span className={active ? "font-medium text-accent" : ""}>{master} master</span>
              <span className={`h-px flex-1 ${active ? "bg-accent" : "bg-line"}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
