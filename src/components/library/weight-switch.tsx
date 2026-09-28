"use client";

import { useRef, type KeyboardEvent } from "react";

import { ICON_WEIGHTS, WEIGHT_LABELS, type IconWeight } from "@/config/icons";

interface WeightSwitchProps {
  value: IconWeight;
  onChange: (weight: IconWeight) => void;
  /** Weights to disable (e.g. Bold for an icon that has no Bold masters). */
  disabled?: readonly IconWeight[];
  /** Fired on hover or focus, so the other weight's artwork can start loading. */
  onIntent?: () => void;
  className?: string;
}

/** Regular / Bold segmented switch (a radio group with arrow-key support). */
export function WeightSwitch({ value, onChange, disabled = [], onIntent, className = "" }: WeightSwitchProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabled = ICON_WEIGHTS.filter((weight) => !disabled.includes(weight));

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = enabled.indexOf(value);
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % enabled.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + enabled.length) % enabled.length;
    else return;
    event.preventDefault();
    const weight = enabled[next];
    onChange(weight);
    refs.current[ICON_WEIGHTS.indexOf(weight)]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Icon weight"
      onKeyDown={handleKeyDown}
      onPointerEnter={onIntent}
      onFocus={onIntent}
      data-testid="weight-switch"
      className={`inline-grid h-8 shrink-0 grid-cols-2 gap-0.5 rounded-full border border-line bg-bg p-0.5 ${className}`}
    >
      {ICON_WEIGHTS.map((weight, index) => {
        const selected = weight === value;
        const isDisabled = disabled.includes(weight);
        return (
          <button
            key={weight}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            disabled={isDisabled}
            title={isDisabled ? `${WEIGHT_LABELS[weight]} isn’t available for this icon yet` : undefined}
            onClick={() => onChange(weight)}
            className={`inline-flex h-full min-w-[4.5rem] items-center justify-center rounded-full px-3 text-[12px] font-normal whitespace-nowrap transition-colors outline-none focus-visible:shadow-[0_0_0_1px_var(--accent-ring),0_0_0_3px_var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-40 ${
              selected ? "bg-surface text-fg shadow-[0_0_0_1px_var(--line)]" : "text-fg-muted hover:text-fg"
            }`}
          >
            {WEIGHT_LABELS[weight]}
          </button>
        );
      })}
    </div>
  );
}
