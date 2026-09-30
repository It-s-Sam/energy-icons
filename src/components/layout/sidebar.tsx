"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Logo } from "@/components/layout/logo";
import { useLibrary } from "@/components/library/library-provider";
import { siteConfig } from "@/config/site";
import { DOCS_PAGES } from "@/data/docs";
import { getNonEmptyCategories, TOTAL_ICONS } from "@/lib/icons/filter";
import { categoryHref } from "@/lib/routes";

import { LibraryLink } from "./library-link";

function NavLink({ href, active, children, count }: { href: string; active: boolean; children: ReactNode; count?: number }) {
  const { setDrawerOpen } = useLibrary();
  return (
    <LibraryLink
      href={href}
      onClick={() => setDrawerOpen(false)}
      aria-current={active ? "page" : undefined}
      className={`group flex h-7 items-center justify-between rounded-md px-2 text-[13px] transition-colors ${
        active ? "font-medium text-accent" : "text-fg-muted hover:bg-sidebar-hover hover:text-fg"
      }`}
    >
      <span className="truncate">{children}</span>
      {count !== undefined && (
        <span className={`text-[11px] tabular-nums ${active ? "text-accent" : "text-fg-subtle"}`}>{count}</span>
      )}
    </LibraryLink>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="mb-1 px-2 text-[11px] font-medium text-fg-subtle">{children}</div>;
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, drawerOpen, setDrawerOpen } = useLibrary();
  const categories = getNonEmptyCategories();
  const resources = [siteConfig.links.sponsor, siteConfig.links.coffee, siteConfig.links.figma].filter(
    (link) => link !== undefined,
  );

  return (
    <>
      {/* Drawer backdrop (small screens) */}
      {/* On small screens the drawer slides in inside the floating library window, which
          clips it to the window's rounded corners. */}
      {drawerOpen && (
        <div className="absolute inset-0 z-30 bg-[var(--backdrop)] md:hidden" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
      )}
      <aside
        className={`absolute inset-y-0 left-0 z-40 flex w-[208px] shrink-0 flex-col border-r border-sidebar-line bg-sidebar transition-[translate,visibility] md:static md:visible md:z-auto md:translate-x-0 ${
          drawerOpen ? "visible translate-x-0 shadow-xl" : "invisible -translate-x-full"
        } ${sidebarCollapsed ? "md:hidden" : ""}`}
        aria-label="Sidebar"
      >
        <div className="flex h-[52px] shrink-0 items-center gap-2 px-4">
          <Link href="/" aria-label="Energy Icons" className="flex items-center text-fg" onClick={() => setDrawerOpen(false)}>
            <Logo />
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-2 pt-3 pb-4">
          <div>
            <SectionLabel>Icons</SectionLabel>
            <div className="flex flex-col gap-px">
              <NavLink href="/" active={pathname === "/"} count={TOTAL_ICONS}>
                All
              </NavLink>
              {categories.map((category) => (
                <NavLink
                  key={category.id}
                  href={categoryHref(category.id)}
                  active={pathname === categoryHref(category.id)}
                  count={category.count}
                >
                  {category.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Docs</SectionLabel>
            <div className="flex flex-col gap-px">
              {DOCS_PAGES.map((doc) => (
                <NavLink key={doc.href} href={doc.href} active={pathname === doc.href}>
                  {doc.label}
                </NavLink>
              ))}
            </div>
          </div>

          {resources.length > 0 && (
            <div>
              <SectionLabel>Resources</SectionLabel>
              <div className="flex flex-col gap-px">
                {resources.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-7 items-center rounded-md px-2 text-[13px] text-fg-muted hover:bg-sidebar-hover hover:text-fg"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="px-4 py-3 text-[11px] text-fg-subtle">
          v{siteConfig.version} · {TOTAL_ICONS} icons
        </div>
      </aside>
    </>
  );
}
