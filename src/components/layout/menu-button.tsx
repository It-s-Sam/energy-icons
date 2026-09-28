"use client";

import { useLibrary } from "@/components/library/library-provider";
import { SidebarGlyph } from "@/components/ui/ui-icons";

/** Toggles the sidebar: collapses it on desktop, opens the drawer on small screens. */
export function MenuButton() {
  const { sidebarCollapsed, setSidebarCollapsed, drawerOpen, setDrawerOpen } = useLibrary();

  const toggle = () => {
    if (window.matchMedia("(min-width: 768px)").matches) setSidebarCollapsed(!sidebarCollapsed);
    else setDrawerOpen(!drawerOpen);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle sidebar"
      className="grid size-8 shrink-0 place-items-center rounded-md text-fg-muted transition-colors hover:bg-hover hover:text-fg"
    >
      <SidebarGlyph />
    </button>
  );
}
