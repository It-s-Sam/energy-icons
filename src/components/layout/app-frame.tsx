"use client";

import { DialRoot } from "dialkit";
import "dialkit/styles.css";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { LibraryStage } from "@/components/hero/library-stage";

/**
 * Every page is the hero with the sidebar + content app window floating below it
 * on a subtle version of the hero background. The page scrolls until the window
 * reaches the top of the viewport, then it locks in place and its own panels take
 * over scrolling. Internal links point at #icons, so moving between pages keeps
 * the window in view.
 */
export function AppFrame({ hero, children }: { hero: ReactNode; children: ReactNode }) {
  const isHome = usePathname() === "/";
  const frameRef = useRef<HTMLDivElement>(null);
  const [held, setHeld] = useState(true);

  // Opening an inner page directly (a shared or bookmarked URL) lands on its
  // content rather than the hero. Only on first load: later navigations carry #icons.
  useLayoutEffect(() => {
    if (!isHome && !window.location.hash && window.scrollY === 0) {
      frameRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- first load only
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const update = () => setHeld(frame.getBoundingClientRect().top > 1);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <>
      {hero}
      {/* Hero tuning panel; DialRoot renders nothing in production builds. */}
      <DialRoot position="bottom-right" defaultOpen={false} />
      <LibraryStage stageRef={frameRef} held={held}>
        {children}
      </LibraryStage>
    </>
  );
}
