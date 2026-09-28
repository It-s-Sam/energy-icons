"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { DEFAULT_ICON_SIZE, DEFAULT_ICON_WEIGHT, type IconSize, type IconWeight } from "@/config/icons";

interface LibraryState {
  query: string;
  setQuery: (query: string) => void;
  size: IconSize;
  setSize: (size: IconSize) => void;
  /** Regular or Bold, applied to every icon in the grid and the detail dialog */
  weight: IconWeight;
  setWeight: (weight: IconWeight) => void;
  /** Sidebar hidden on desktop (toggled from the toolbar menu button) */
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  /** Sidebar drawer open on small screens */
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const LibraryContext = createContext<LibraryState | null>(null);

/**
 * Browser state that should survive navigation between categories and docs
 * (lives in the root layout, which persists across routes).
 */
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [size, setSize] = useState<IconSize>(DEFAULT_ICON_SIZE);
  const [weight, setWeight] = useState<IconWeight>(DEFAULT_ICON_WEIGHT);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const value = useMemo(
    () => ({
      query,
      setQuery,
      size,
      setSize,
      weight,
      setWeight,
      sidebarCollapsed,
      setSidebarCollapsed,
      drawerOpen,
      setDrawerOpen,
    }),
    [query, size, weight, sidebarCollapsed, drawerOpen],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryState {
  const context = useContext(LibraryContext);
  if (!context) throw new Error("useLibrary must be used inside <LibraryProvider>");
  return context;
}
