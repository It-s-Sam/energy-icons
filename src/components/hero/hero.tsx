"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";

import { siteConfig } from "@/config/site";
import { inLibrary } from "@/lib/routes";

import { HeroBackground } from "./hero-background";
import { useHeroFieldDials, useHeroLayoutDials } from "./hero-dials";

/** The Energy Icons mark (sun over a house) in white, from the Paper design. */
function HeroMark() {
  return (
    <svg width="65" height="45" viewBox="-38.269 206.961 65.005 44.518" aria-hidden="true" fill="#fff">
      <path d="M-6.874 218.53V211.635C-6.874 210.684-6.095 209.909-5.132 209.909-4.17 209.909-3.391 210.684-3.391 211.635V218.53C-3.391 219.48-4.17 220.252-5.132 220.252-6.095 220.252-6.874 219.48-6.874 218.53Z" />
      <path d="M-19.705 213.784C-18.872 213.307-17.807 213.588-17.327 214.414L-13.84 220.391C-13.357 221.217-13.643 222.273-14.477 222.747-15.307 223.224-16.375 222.94-16.854 222.117L-20.341 216.136C-20.824 215.314-20.538 214.258-19.705 213.784Z" />
      <path d="M-30.372 224.344C-29.893 223.519-28.828 223.234-27.994 223.711L-21.953 227.167C-21.12 227.641-20.838 228.697-21.317 229.519-21.797 230.345-22.861 230.626-23.695 230.152L-29.736 226.7C-30.57 226.223-30.855 225.167-30.372 224.344Z" />
      <path d="M-26.028 237.49C-25.066 237.49-24.287 238.265-24.287 239.216-24.287 240.167-25.066 240.939-26.028 240.939H-32.992C-33.954 240.939-34.733 240.167-34.733 239.216-34.733 238.265-33.954 237.49-32.992 237.49H-26.028Z" />
      <path d="M22.727 237.49C23.689 237.49 24.469 238.265 24.469 239.216 24.469 240.167 23.689 240.939 22.727 240.939H15.761C14.801 240.939 14.022 240.167 14.022 239.216 14.022 238.265 14.801 237.49 15.761 237.49H22.727Z" />
      <path d="M17.727 223.715C18.56 223.238 19.625 223.522 20.108 224.344 20.587 225.17 20.302 226.223 19.468 226.7L13.427 230.156C12.597 230.63 11.529 230.348 11.049 229.519 10.569 228.7 10.852 227.644 11.686 227.167L17.727 223.715Z" />
      <path d="M7.059 214.414C7.542 213.588 8.607 213.307 9.44 213.784 10.271 214.258 10.556 215.311 10.077 216.136L6.587 222.117C6.106 222.943 5.042 223.227 4.209 222.75 3.375 222.273 3.09 221.217 3.569 220.395L7.059 214.414Z" />
      <path d="M-19.583 233.686L-5.132 222.402 9.318 233.686V247.79H-19.583L-19.583 233.686Z" />
    </svg>
  );
}

/** The GitHub mark (Octicons mark-github). */
function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" width="17" height="17" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

/**
 * A vector edit handle (a line with anchor dots at both ends and the middle) drawn
 * over the headline, as in the design. Geometry is in design pixels from the
 * headline box's top-left: (x, y) is the first anchor, then length and angle.
 */
function Handle({ x, y, length, angle }: { x: number; y: number; length: number; angle: number }) {
  return (
    <span
      aria-hidden="true"
      className="hero-handle"
      style={{ "--x": x, "--y": y, "--length": length, "--angle": `${angle}deg` } as React.CSSProperties}
    >
      <span className="hero-handle-dot" style={{ left: 0 }} />
      <span className="hero-handle-dot" style={{ left: "50%" }} />
      <span className="hero-handle-dot" style={{ left: "100%" }} />
    </span>
  );
}

const navLinkClass = "hero-nav-link rounded-md font-medium leading-[1.5] focus-visible:outline-white";

export function Hero() {
  const { github, sponsor } = siteConfig.links;
  const layout = useHeroLayoutDials();
  const field = useHeroFieldDials();
  // The hero sits above every page; elsewhere the page's own title is the h1.
  const Headline = usePathname() === "/" ? "h1" : "p";

  return (
    <section
      className="hero relative isolate flex min-h-[max(560px,100svh)] flex-col items-center overflow-hidden text-white"
      style={layout.style}
    >
      <HeroBackground settings={field} />

      <header className="hero-header relative flex h-[59px] w-full shrink-0 items-center justify-between pt-3">
        <Link href="/" aria-label={`${siteConfig.name} home`} className="rounded-md focus-visible:outline-white">
          <HeroMark />
        </Link>
        <nav aria-label="Primary" className="hero-nav flex items-center">
          <Link href={inLibrary("/")} className={navLinkClass}>
            Icons
          </Link>
          <Link href={inLibrary("/docs/installation")} className={`${navLinkClass} max-sm:hidden`}>
            Docs
          </Link>
          {sponsor && (
            <a href={sponsor.href} target="_blank" rel="noreferrer" className={`${navLinkClass} max-sm:hidden`}>
              {sponsor.label}
            </a>
          )}
          {github && (
            <a
              href={github.href}
              target="_blank"
              rel="noreferrer"
              className="hero-github flex items-center gap-2 rounded-full bg-white font-medium text-[#111] focus-visible:outline-white"
            >
              <GitHubMark />
              Star on GitHub
            </a>
          )}
        </nav>
      </header>

      <div className="hero-content relative flex flex-1 flex-col items-center justify-center px-4">
        <Headline className="hero-headline">
          <span className="hero-word hero-word-energy">Energy</span>{" "}
          <span className="hero-word hero-word-icons">Icons</span>
          {layout.handles.visible && (
            <>
              <Handle {...layout.handles.flat} />
              <Handle {...layout.handles.tilted} />
            </>
          )}
        </Headline>

        <div className="hero-cta flex flex-col items-center">
          <p className="hero-subtitle text-center text-balance">
            A free, open-source icon library for everyone, with deeper coverage for energy, climate and
            infrastructure.
          </p>
          <Link
            href={inLibrary("/")}
            className="hero-button rounded-full bg-white text-[#111] focus-visible:outline-white"
          >
            View icons
          </Link>
        </div>
      </div>
    </section>
  );
}
