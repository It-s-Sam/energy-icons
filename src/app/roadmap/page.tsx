import type { Metadata } from "next";
import type { CSSProperties } from "react";

import { Icon } from "@/components/icon";
import { GithubButton } from "@/components/layout/github-button";
import { MenuButton } from "@/components/layout/menu-button";
import { ThemeToggle } from "@/components/layout/theme";
import { siteConfig } from "@/config/site";
import { ROADMAP, ROADMAP_STATUS_LABELS, type RoadmapStatus } from "@/data/roadmap";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "What's shipped, what's in progress, and what Energy Icons powers up next.",
};

/** Width of one pylon's column on the desktop power line, in px. */
const COLUMN = 264;
/** Height at which the cable meets each pylon's crossarm, and how far it sags between them. */
const CABLE_Y = 30;
const SAG = 16;

const isPowered = (status: RoadmapStatus) => status === "shipped" || status === "now";

/** The cable between pylons: lit up to the current milestone, pulsing into it, dim beyond. */
function PowerLine() {
  const width = ROADMAP.length * COLUMN;
  const spans = ROADMAP.slice(1).map((milestone, index) => {
    const x1 = COLUMN * (index + 0.5);
    const x2 = COLUMN * (index + 1.5);
    const d = `M ${x1} ${CABLE_Y} Q ${(x1 + x2) / 2} ${CABLE_Y + SAG * 2} ${x2} ${CABLE_Y}`;
    const state = !isPowered(milestone.status) ? "dark" : milestone.status === "now" ? "charging" : "lit";
    return { d, state, id: milestone.id };
  });
  return (
    <svg className="roadmap-cable" width={width} height={CABLE_Y + SAG * 2 + 8} aria-hidden="true">
      {spans.map((span) => (
        <g key={span.id} data-state={span.state}>
          <path className="roadmap-cable-base" d={span.d} />
          {span.state !== "dark" && <path className="roadmap-cable-flow" d={span.d} />}
        </g>
      ))}
    </svg>
  );
}

export default function RoadmapPage() {
  const sponsor = siteConfig.links.sponsor;

  return (
    <>
      <header className="flex h-[52px] shrink-0 items-center justify-between gap-3 border-b border-line px-3">
        <div className="flex items-center gap-1 text-[13px]">
          <MenuButton />
          <span className="pl-1 text-fg">Roadmap</span>
        </div>
        <div className="flex items-center">
          <GithubButton />
          <ThemeToggle />
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-4 pt-6 pb-16 sm:px-8">
          <section className="roadmap-banner rounded-[28px] px-6 py-10 text-white sm:px-10 sm:py-14">
            <p className="text-[12px] font-medium tracking-[0.08em] text-white/70 uppercase">Roadmap</p>
            <h1 className="mt-2 max-w-[640px] text-[clamp(30px,4vw,48px)] leading-[1.05] font-bold tracking-[-0.04em]">
              Where the grid goes next
            </h1>
            <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-white/85">
              Every milestone is a pylon on the line. Shipped ones are powered, the current one is charging, and
              sponsors help power what comes next.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2 text-[12px]" aria-label="Legend">
              <li className="roadmap-legend" data-state="lit">Shipped</li>
              <li className="roadmap-legend" data-state="charging">In progress</li>
              <li className="roadmap-legend" data-state="dark">Planned</li>
            </ul>
          </section>

          <div className="roadmap-scroll mt-8" tabIndex={0} aria-label="Roadmap milestones">
            <div className="roadmap-track" style={{ "--column": `${COLUMN}px` } as CSSProperties}>
              <PowerLine />
              <ol className="roadmap-milestones">
                {ROADMAP.map((milestone, index) => {
                  const next = ROADMAP[index + 1];
                  return (
                    <li
                      key={milestone.id}
                      className="roadmap-milestone"
                      data-status={milestone.status}
                      // On phones a vertical cable runs down to the next pylon; it is lit if that one is powered.
                      data-cable={next ? (isPowered(next.status) ? (next.status === "now" ? "charging" : "lit") : "dark") : "end"}
                    >
                      <div className="roadmap-pylon" aria-hidden="true">
                        <Icon name="pylon" size={40} />
                      </div>
                      <article className="roadmap-card">
                        <div className="flex items-center justify-between gap-2">
                          <span className="roadmap-status">{ROADMAP_STATUS_LABELS[milestone.status]}</span>
                          <span className="text-[11.5px] text-fg-subtle tabular-nums">{milestone.when}</span>
                        </div>
                        <div className="roadmap-frame" aria-hidden="true">
                          <Icon name={milestone.icon} size={28} />
                        </div>
                        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-fg">{milestone.title}</h2>
                        <p className="mt-1.5 text-[12.5px] leading-relaxed text-fg-muted">{milestone.summary}</p>
                        <ul className="mt-3 flex flex-col gap-1.5">
                          {milestone.items.map((item) => (
                            <li key={item} className="roadmap-item text-[12px] text-fg-muted">
                              {item}
                            </li>
                          ))}
                        </ul>
                        {milestone.sponsorable && sponsor && (
                          <a
                            href={sponsor.href}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex h-8 items-center rounded-full border border-line px-3 text-[12px] font-medium text-accent transition-colors hover:bg-accent-softer"
                          >
                            Power this next
                          </a>
                        )}
                      </article>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
