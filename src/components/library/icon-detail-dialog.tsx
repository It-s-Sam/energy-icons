"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

import { BrowserIcon } from "@/components/library/browser-icon";
import { WeightSwitch } from "@/components/library/weight-switch";
import { CheckGlyph, CloseGlyph, CopyGlyph, DownloadGlyph } from "@/components/ui/ui-icons";
import {
  getMasterForSize,
  SUPPORTED_SIZES,
  WEIGHT_LABELS,
  WEIGHT_STROKE_PX,
  type IconSize,
  type IconWeight,
} from "@/config/icons";
import { CATEGORY_LABELS } from "@/data/categories";
import { getIconMeta, type IconName } from "@/data/icons";
import { track } from "@/lib/analytics";
import { copyText, downloadText } from "@/lib/browser";
import { getBrowserSvg, loadMaster, peekMaster } from "@/lib/icons/browser-masters";
import { FRAMEWORKS, getIconSnippet, type FrameworkId } from "@/lib/icons/snippets";
import { getIconFileName, hasWeight, resolveWeight } from "@/lib/icons/weight";

/** Magnified preview size per master, chosen so each grid cell is whole pixels. */
const MAGNIFIED = { 20: { size: 160, cell: 8 }, 48: { size: 192, cell: 4 } } as const;

function useFlag(duration = 1600) {
  const [on, setOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const trigger = () => {
    setOn(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOn(false), duration);
  };
  return [on, trigger] as const;
}

interface IconDetailDialogProps {
  name: IconName;
  /** Size the browser is currently showing. The dialog can change its own export size. */
  initialSize: IconSize;
  /** Weight the browser is currently showing. The dialog can switch its own weight. */
  initialWeight: IconWeight;
  onClose: () => void;
}

export function IconDetailDialog({ name, initialSize, initialWeight, onClose }: IconDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [size, setSize] = useState<IconSize>(initialSize);
  // Icons without Bold masters fall back to Regular.
  const [weight, setWeight] = useState<IconWeight>(resolveWeight(name, initialWeight));
  const [copied, flagCopied] = useFlag();
  const [snippetCopied, flagSnippetCopied] = useFlag();
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [copyError, setCopyError] = useState(false);
  const [framework, setFramework] = useState<FrameworkId>("react");
  const [shown, setShown] = useState({ size: initialSize, weight: resolveWeight(name, initialWeight) });
  const frameworkRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const meta = getIconMeta(name);
  const master = getMasterForSize(size);
  const shownMaster = getMasterForSize(shown.size);
  const shownMagnified = MAGNIFIED[shownMaster];
  const pictureReady = peekMaster(shown.weight, shownMaster) !== undefined;
  // The Inline SVG snippet needs the artwork, which is ready once this master has loaded.
  const inlineSvg = peekMaster(weight, master) ? getBrowserSvg(name, size, weight) : undefined;
  const snippet = getIconSnippet(framework, name, size, weight, inlineSvg);
  const fileName = getIconFileName(name, size, weight);

  useEffect(() => {
    let live = true;
    loadMaster(weight, master).then(() => {
      if (live) setShown({ size, weight });
    });
    return () => {
      live = false;
    };
  }, [size, weight, master]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const handleCopy = async () => {
    try {
      await loadMaster(weight, master);
      await copyText(getBrowserSvg(name, size, weight));
      track("icon_copy", { icon: name, size, weight });
      setCopyError(false);
      flagCopied();
    } catch {
      setCopyError(true);
    }
  };

  const handleDownload = async () => {
    await loadMaster(weight, master);
    downloadText(getBrowserSvg(name, size, weight), fileName);
    track("icon_download", { icon: name, size, weight });
  };

  const handleSnippet = async () => {
    try {
      await copyText(snippet);
      track("snippet_copy", { icon: name, framework });
      setCopiedSnippet(snippet);
      flagSnippetCopied();
    } catch {
      /* ignore */
    }
  };

  const handleFrameworkKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = FRAMEWORKS.findIndex((item) => item.id === framework);
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % FRAMEWORKS.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + FRAMEWORKS.length) % FRAMEWORKS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = FRAMEWORKS.length - 1;
    else return;
    event.preventDefault();
    setFramework(FRAMEWORKS[next].id);
    frameworkRefs.current[next]?.focus();
  };

  return (
    <dialog
      ref={dialogRef}
      className="icon-dialog"
      aria-labelledby="icon-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        // Clicks on the ::backdrop land on the <dialog> element itself.
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className="dialog-glass w-[520px] max-w-full">
        <div className="flex max-h-[calc(100dvh-36px)] flex-col overflow-y-auto rounded-[28px] bg-surface">
          <div className="relative flex flex-wrap items-start justify-between gap-x-4 gap-y-3 px-5 pt-4 pb-3">
            <div className="min-w-0 flex-1 basis-40 max-sm:pr-12">
              <h2 id="icon-dialog-title" className="text-[15px] font-semibold tracking-[-0.01em] text-fg">
                {meta.name}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-fg-muted">
                <code className="font-mono text-[11.5px] text-fg-muted">{meta.slug}</code>
                <span className="text-fg-subtle" aria-hidden="true">
                  ·
                </span>
                <span>{CATEGORY_LABELS[meta.category]}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 max-sm:w-full max-sm:[&>label]:ml-auto">
              <WeightSwitch
                value={weight}
                onChange={setWeight}
                disabled={hasWeight(name, "bold") ? [] : ["bold"]}
                onIntent={() => loadMaster(weight === "bold" ? "regular" : "bold", master)}
              />
              <label className="relative">
                <span className="sr-only">Size</span>
                <select
                  value={size}
                  onChange={(event) => setSize(Number(event.target.value) as IconSize)}
                  aria-label="Size"
                  onFocus={() => {
                    loadMaster(weight, 20);
                    loadMaster(weight, 48);
                  }}
                  className="h-8 appearance-none rounded-full border border-line bg-bg pr-7 pl-3 text-[12px] font-medium text-fg tabular-nums outline-none hover:bg-hover"
                >
                  {SUPPORTED_SIZES.map((option) => (
                    <option key={option} value={option}>
                      {option}px
                    </option>
                  ))}
                </select>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-fg-muted"
                >
                  <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </label>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Close"
                // On phones the controls wrap below the title, so the close button moves to the
                // top-right corner and is always filled to read as the way out.
                className="grid size-8 place-items-center rounded-full border border-transparent text-fg-muted transition-transform hover:rotate-90 hover:border-line hover:bg-hover hover:text-fg max-sm:absolute max-sm:top-3.5 max-sm:right-4 max-sm:size-9 max-sm:border-line max-sm:bg-hover max-sm:text-fg"
              >
                <CloseGlyph />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 px-5 pb-5">
            <figure className="overflow-hidden rounded-[22px] border border-line">
              <div className="dialog-stage grid h-[248px] place-items-center sm:h-[272px]" data-testid="detail-preview">
                <div className="dialog-frame">
                  <div
                    className="master-grid relative"
                    style={{ width: shownMagnified.size, height: shownMagnified.size, "--cell": `${shownMagnified.cell}px` } as CSSProperties}
                  >
                    {pictureReady && (
                      <BrowserIcon name={name} master={shownMaster} weight={shown.weight} size={shownMagnified.size} className="absolute inset-0" />
                    )}
                  </div>
                </div>
              </div>
              <figcaption className="flex items-center justify-between border-t border-line bg-bg px-3.5 py-2 text-[12px] text-fg-muted">
                <span>
                  <span className="font-medium text-fg" data-testid="detail-master">
                    {shownMaster} master
                  </span>
                  <span className="text-fg-subtle">
                    {" "}
                    · {shownMaster}×{shownMaster} · <span data-testid="detail-weight">{WEIGHT_LABELS[shown.weight]}</span>
                  </span>
                </span>
                <span className="tabular-nums">{WEIGHT_STROKE_PX[shown.weight][shownMaster]}px stroke</span>
              </figcaption>
            </figure>

            <section aria-label="Usage">
              <div
                role="tablist"
                aria-label="Framework"
                onKeyDown={handleFrameworkKeyDown}
                className="mb-2 flex flex-wrap gap-1"
              >
                {FRAMEWORKS.map((item, index) => {
                  const selected = item.id === framework;
                  return (
                    <button
                      key={item.id}
                      ref={(el) => {
                        frameworkRefs.current[index] = el;
                      }}
                      type="button"
                      role="tab"
                      id={`framework-tab-${item.id}`}
                      aria-selected={selected}
                      aria-controls="framework-snippet"
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setFramework(item.id)}
                      className={`h-7 rounded-full px-2.5 text-[12px] whitespace-nowrap transition-colors ${
                        selected ? "bg-hover font-medium text-fg" : "text-fg-muted hover:bg-hover hover:text-fg"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-start justify-between gap-2 rounded-[18px] border border-line bg-bg py-2 pr-1.5 pl-3.5">
                <pre
                  id="framework-snippet"
                  role="tabpanel"
                  aria-labelledby={`framework-tab-${framework}`}
                  className="max-h-44 min-h-20 min-w-0 flex-1 overflow-x-hidden overflow-y-auto py-1 font-mono text-[12px] leading-5 break-words whitespace-pre-wrap text-fg-muted"
                >
                  <code>{snippet}</code>
                </pre>
                <button
                  type="button"
                  onClick={handleSnippet}
                  className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full px-2.5 text-[11.5px] text-fg-muted hover:bg-hover hover:text-fg"
                >
                  {snippetCopied && copiedSnippet === snippet ? <CheckGlyph size={14} className="pop text-accent" /> : <CopyGlyph size={14} />}
                  {snippetCopied && copiedSnippet === snippet ? "Copied" : "Copy"}
                </button>
              </div>
            </section>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
            <p className="min-w-0 truncate font-mono text-[11.5px] text-fg-muted" aria-live="polite">
              {copyError ? "Couldn’t access the clipboard." : copied ? "SVG copied to clipboard" : fileName}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong px-3.5 text-[12px] font-medium text-fg transition-colors hover:bg-hover"
              >
                <DownloadGlyph size={14} />
                Download SVG
              </button>
              <button
                type="button"
                onClick={handleCopy}
                data-testid="copy-svg"
                className="inline-flex h-9 min-w-[116px] items-center justify-center gap-1.5 rounded-full bg-accent px-4 text-[12px] font-medium text-white transition-[background-color,translate] hover:-translate-y-px hover:bg-[#0060e0] active:translate-y-0"
              >
                {copied ? <CheckGlyph size={14} className="pop" /> : <CopyGlyph size={14} />}
                {copied ? "Copied" : "Copy SVG"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
