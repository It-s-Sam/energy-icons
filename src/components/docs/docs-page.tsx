import type { ReactNode } from "react";

import { GithubButton } from "@/components/layout/github-button";
import { MenuButton } from "@/components/layout/menu-button";
import { ThemeToggle } from "@/components/layout/theme";

export function DocsPage({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return (
    <>
      <header className="flex h-[52px] shrink-0 items-center justify-between gap-3 border-b border-line px-3">
        <div className="flex items-center gap-1 text-[13px]">
          <MenuButton />
          <span className="pl-1 text-fg-subtle">Docs</span>
          <span className="text-fg-subtle">/</span>
          <span className="text-fg">{title}</span>
        </div>
        <div className="flex items-center">
          <GithubButton />
          <ThemeToggle />
        </div>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <article className="mx-auto max-w-[680px] px-6 pt-12 pb-24">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-fg">{title}</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-fg-muted">{lead}</p>
          <div className="mt-10 flex flex-col gap-10">{children}</div>
        </article>
      </main>
    </>
  );
}

export function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[14px] font-semibold text-fg">{title}</h2>
      {children}
    </section>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-[13.5px] leading-[1.65] text-fg-muted">{children}</p>;
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="rounded bg-hover px-1 py-px font-mono text-[12px] text-fg">{children}</code>;
}

export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-2xl border border-line bg-surface px-4 py-3 font-mono text-[12px] leading-[1.6] text-fg">
      <code>{children}</code>
    </pre>
  );
}

export function Steps({ children }: { children: ReactNode }) {
  return <ol className="flex flex-col gap-5 [counter-reset:step]">{children}</ol>;
}

export function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="relative pl-9 [counter-increment:step] before:absolute before:top-0 before:left-0 before:grid before:size-6 before:place-items-center before:rounded-full before:border before:border-line before:text-[11px] before:font-medium before:text-fg-muted before:content-[counter(step)]">
      <h3 className="pt-0.5 text-[13.5px] font-medium text-fg">{title}</h3>
      <div className="mt-2 flex flex-col gap-2">{children}</div>
    </li>
  );
}
