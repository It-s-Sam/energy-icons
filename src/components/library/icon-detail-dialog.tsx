"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { Icon, IconMasterSvg } from "@/components/icon";
import { SizeSelector } from "@/components/library/size-selector";
import { CheckGlyph, CloseGlyph, CopyGlyph, DownloadGlyph } from "@/components/ui/ui-icons";
import { getMasterForSize, MASTER_STROKE_PX, snapToSupportedSize, type IconSize } from "@/config/icons";
import { CATEGORY_LABELS } from "@/data/categories";
import { getIconMeta, type IconName } from "@/data/icons";
import { copyText, downloadText } from "@/lib/browser";
import { getIconFileName, getIconSvg } from "@/lib/icons";

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
  initialSize: number;
  onClose: () => void;
}

export function IconDetailDialog({ name, initialSize, onClose }: IconDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [size, setSize] = useState<IconSize>(snapToSupportedSize(initialSize));
  const [copied, flagCopied] = useFlag();
  const [snippetCopied, flagSnippetCopied] = useFlag();
  const [copyError, setCopyError] = useState(false);

  const meta = getIconMeta(name);
  const master = getMasterForSize(size);
  const magnified = MAGNIFIED[master];
  const snippet = `<Icon name="${name}" size={${size}} />`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const handleCopy = async () => {
    try {
      await copyText(getIconSvg(name, size));
      setCopyError(false);
      flagCopied();
    } catch {
      setCopyError(true);
    }
  };

  const handleDownload = () => downloadText(getIconSvg(name, size), getIconFileName(name, size));

  const handleSnippet = async () => {
    try {
      await copyText(snippet);
      flagSnippetCopied();
    } catch {
      /* ignore */
    }
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
      <div className="flex w-[760px] max-w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_64px_-16px_rgb(0_0_0/0.25)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id="icon-dialog-title" className="text-[15px] font-semibold tracking-[-0.01em] text-fg">
              {meta.name}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-fg-muted">
              <code className="font-mono text-[11.5px]">{meta.slug}</code>
              <span className="text-fg-subtle">·</span>
              <span>{CATEGORY_LABELS[meta.category]}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="-mt-1 -mr-2 grid size-8 place-items-center rounded-md text-fg-muted hover:bg-hover hover:text-fg"
          >
            <CloseGlyph />
          </button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto px-5 py-5">
          {/* Previews */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.25fr_1fr]">
            <figure className="flex flex-col overflow-hidden rounded-xl border border-line bg-bg">
              <div className="grid h-[216px] place-items-center text-fg" data-testid="detail-preview">
                <Icon name={name} size={size} />
              </div>
              <figcaption className="flex items-center justify-between border-t border-line px-3 py-2 text-[11px] text-fg-muted">
                <span>Actual size</span>
                <span className="tabular-nums">
                  {size}×{size}px
                </span>
              </figcaption>
            </figure>
            <figure className="flex flex-col overflow-hidden rounded-xl border border-line bg-bg">
              <div className="grid h-[216px] place-items-center text-fg">
                <div
                  className="master-grid relative"
                  style={{ width: magnified.size, height: magnified.size, "--cell": `${magnified.cell}px` } as CSSProperties}
                >
                  <IconMasterSvg name={name} master={master} size={magnified.size} className="absolute inset-0" />
                </div>
              </div>
              <figcaption className="flex items-center justify-between border-t border-line px-3 py-2 text-[11px] text-fg-muted">
                <span>
                  <span className="font-medium text-accent" data-testid="detail-master">
                    {master} master
                  </span>{" "}
                  · {master}×{master} grid
                </span>
                <span>{MASTER_STROKE_PX[master]}px stroke</span>
              </figcaption>
            </figure>
          </div>

          {/* Size */}
          <section aria-label="Size">
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-[12px] font-medium text-fg">Size</h3>
              <p className="text-[11px] text-fg-muted">
                Scaling the {master}×{master} master to {size}px
              </p>
            </div>
            <SizeSelector value={size} onChange={setSize} />
          </section>

          {/* Keywords */}
          <section aria-label="Keywords">
            <h3 className="mb-2 text-[12px] font-medium text-fg">Keywords</h3>
            <ul className="flex flex-wrap gap-1.5">
              {meta.keywords.map((keyword) => (
                <li key={keyword} className="rounded-md border border-line px-2 py-0.5 text-[11.5px] text-fg-muted">
                  {keyword}
                </li>
              ))}
            </ul>
          </section>

          {/* Usage */}
          <section aria-label="React usage">
            <h3 className="mb-2 text-[12px] font-medium text-fg">React</h3>
            <div className="flex items-center justify-between gap-2 rounded-lg border border-line bg-bg py-1 pr-1 pl-3">
              <code className="truncate font-mono text-[12px] text-fg-muted">{snippet}</code>
              <button
                type="button"
                onClick={handleSnippet}
                className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-[11.5px] text-fg-muted hover:bg-hover hover:text-fg"
              >
                {snippetCopied ? <CheckGlyph size={14} className="text-accent" /> : <CopyGlyph size={14} />}
                {snippetCopied ? "Copied" : "Copy"}
              </button>
            </div>
          </section>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
          <p className="text-[11px] text-fg-muted" aria-live="polite">
            {copyError ? "Couldn’t access the clipboard." : copied ? "SVG copied to clipboard" : `${getIconFileName(name, size)}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line-strong px-3 text-[12px] font-medium text-fg hover:bg-hover"
            >
              <DownloadGlyph size={14} />
              Download SVG
            </button>
            <button
              type="button"
              onClick={handleCopy}
              data-testid="copy-svg"
              className="inline-flex h-8 min-w-[108px] items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-[12px] font-medium text-primary-fg hover:bg-primary-hover"
            >
              {copied ? <CheckGlyph size={14} /> : <CopyGlyph size={14} />}
              {copied ? "Copied" : "Copy SVG"}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
