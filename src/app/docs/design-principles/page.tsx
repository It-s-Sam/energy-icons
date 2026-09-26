import type { Metadata } from "next";

import { Code, DocSection, DocsPage, P } from "@/components/docs/docs-page";
import { Icon } from "@/components/icon";
import {
  getMasterForSize,
  getSizesForMaster,
  ICON_MASTERS,
  MASTER_STROKE_PX,
  OPTICAL_MASTER_BREAKPOINT,
  SUPPORTED_SIZES,
} from "@/config/icons";

export const metadata: Metadata = { title: "Design principles" };

export default function DesignPrinciplesPage() {
  return (
    <DocsPage
      title="Design principles"
      lead="Every icon is drawn twice, at two optical sizes. The masters are scaled proportionally and never redrawn in code."
    >
      <DocSection title="Two optical masters">
        <div className="grid gap-3 sm:grid-cols-2">
          {ICON_MASTERS.map((master) => {
            const sizes = getSizesForMaster(master);
            return (
              <div key={master} className="rounded-xl border border-line bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-fg">{master} master</span>
                  <span className="text-[11px] text-fg-subtle">
                    {master}×{master} · {MASTER_STROKE_PX[master]}px stroke
                  </span>
                </div>
                <div className="mt-6 mb-4 grid h-16 place-items-center text-fg">
                  <Icon name="wind-turbine" size={master} />
                </div>
                <p className="text-[12px] text-fg-muted">
                  Used for {sizes[0]}–{sizes[sizes.length - 1]}px ({sizes.join(", ")}).
                </p>
              </div>
            );
          })}
        </div>
        <P>
          Small icons need open counters and a light touch. Large icons need a heavier line to hold their presence.
          One drawing can’t do both, so each icon ships as a 20 master drawn with a 1px stroke and a 48 master
          drawn with a 2px stroke. Both are outlined to fills before export.
        </P>
      </DocSection>

      <DocSection title="The scaling rule">
        <P>
          Sizes below <Code>{OPTICAL_MASTER_BREAKPOINT}px</Code> use the 20 master. Sizes from{" "}
          <Code>{OPTICAL_MASTER_BREAKPOINT}px</Code> up use the 48 master. The chosen master is scaled through{" "}
          <Code>width</Code> and <Code>height</Code> only. Path data is never edited, strokes are never
          re-weighted, and <Code>non-scaling-stroke</Code> is never used. The breakpoint is{" "}
          <Code>OPTICAL_MASTER_BREAKPOINT</Code> in <Code>src/config/icons.ts</Code>.
        </P>
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <div className="flex min-w-max items-end">
            {SUPPORTED_SIZES.map((size, i) => {
              const master = getMasterForSize(size);
              const boundary = i > 0 && master !== getMasterForSize(SUPPORTED_SIZES[i - 1]);
              return (
                <div
                  key={size}
                  className={`flex flex-1 flex-col items-center gap-3 px-3 pt-6 pb-3 ${boundary ? "border-l border-line" : ""}`}
                >
                  <div className="grid h-16 place-items-end text-fg">
                    <Icon name="solar-panel-sun" size={size} />
                  </div>
                  <div className="text-center">
                    <div className="text-[12px] font-medium tabular-nums text-fg">{size}</div>
                    <div className={`text-[10.5px] ${master === 48 ? "text-accent" : "text-fg-subtle"}`}>{master}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DocSection>

      <DocSection title="Drawing rules">
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[13.5px] leading-[1.6] text-fg-muted marker:text-fg-subtle">
          <li>Full-frame viewBox: <Code>0 0 20 20</Code> and <Code>0 0 48 48</Code>.</li>
          <li>
            A single <Code>currentColor</Code> fill, so icons pick up the text colour and work in light and dark
            themes.
          </li>
          <li>Outlined geometry with no live strokes, masks, raster images or embedded styles.</li>
          <li>The SVG exported from Figma is the source of truth. Fixes are made in Figma and re-exported.</li>
        </ul>
      </DocSection>
    </DocsPage>
  );
}
