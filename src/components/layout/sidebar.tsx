"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Icon } from "@/components/icon";
import { useLibrary } from "@/components/library/library-provider";
import { siteConfig } from "@/config/site";
import { getNonEmptyCategories, TOTAL_ICONS } from "@/lib/icons/filter";
import { categoryHref } from "@/lib/routes";

const DOCS = [
  { href: "/docs/adding-an-icon", label: "Adding an icon" },
  { href: "/docs/design-principles", label: "Design principles" },
];

function NavLink({ href, active, children, count }: { href: string; active: boolean; children: ReactNode; count?: number }) {
  const { setDrawerOpen } = useLibrary();
  return (
    <Link
      href={href}
      onClick={() => setDrawerOpen(false)}
      aria-current={active ? "page" : undefined}
      className={`group flex h-7 items-center justify-between rounded-md px-2 text-[13px] transition-colors ${
        active ? "bg-accent-softer font-medium text-accent" : "text-fg-muted hover:bg-hover hover:text-fg"
      }`}
    >
      <span className="truncate">{children}</span>
      {count !== undefined && (
        <span className={`text-[11px] tabular-nums ${active ? "text-accent" : "text-fg-subtle"}`}>{count}</span>
      )}
    </Link>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="mb-1 px-2 text-[11px] font-medium text-fg-subtle">{children}</div>;
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, drawerOpen, setDrawerOpen } = useLibrary();
  const categories = getNonEmptyCategories();
  const resources = Object.values(siteConfig.links).filter((link) => link !== undefined);

  return (
    <>
      {/* Drawer backdrop (small screens) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-30 bg-[var(--backdrop)] md:hidden" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[208px] shrink-0 flex-col border-r border-line bg-bg transition-transform md:static md:z-auto md:translate-x-0 ${
          drawerOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
        } ${sidebarCollapsed ? "md:hidden" : ""}`}
        aria-label="Sidebar"
      >
        <div className="flex h-[52px] shrink-0 items-center gap-2 px-4">
          <Link href="/" className="flex items-center gap-2 rounded-md text-fg" onClick={() => setDrawerOpen(false)}>
            <Icon name="wind-turbine" size={20} />
            <span className="text-[14px] font-semibold tracking-[-0.01em]">{siteConfig.name}</span>
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
              {DOCS.map((doc) => (
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
                    className="flex h-7 items-center rounded-md px-2 text-[13px] text-fg-muted hover:bg-hover hover:text-fg"
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
