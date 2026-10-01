import type { Metadata } from "next";

import { DocsPage } from "@/components/docs/docs-page";
import { Icon } from "@/components/icon";
import { ROADMAP, ROADMAP_STATUS_LABELS } from "@/data/roadmap";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "What's shipped, what's in progress, and what Energy Icons works on next.",
};

export default function RoadmapPage() {
  return (
    <DocsPage
      title="Roadmap"
      section="Project"
      lead="What's shipped, what's in progress, and what comes next. Timings are rough and may change."
    >
      <ol className="roadmap">
        {ROADMAP.map((milestone) => (
          <li key={milestone.id} className="roadmap-entry" data-status={milestone.status}>
            <div className="roadmap-meta">
              <span className="text-[12px] text-fg-muted tabular-nums">{milestone.when}</span>
              <span className="roadmap-status text-[11.5px]">{ROADMAP_STATUS_LABELS[milestone.status]}</span>
            </div>
            <span className="roadmap-dot" aria-hidden="true" />
            <div className="min-w-0 pb-9">
              <h2 className="flex items-center gap-2 text-[14px] font-semibold text-fg">
                <Icon name={milestone.icon} size={16} className="shrink-0 text-fg-muted" />
                {milestone.title}
              </h2>
              <p className="mt-1 text-[13px] leading-[1.6] text-fg-muted">{milestone.summary}</p>
              <ul className="mt-2 flex flex-col gap-0.5">
                {milestone.items.map((item) => (
                  <li key={item} className="text-[12.5px] leading-[1.6] text-fg-muted before:mr-2 before:text-fg-subtle before:content-['–']">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </DocsPage>
  );
}
