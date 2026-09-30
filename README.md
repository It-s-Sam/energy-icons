# Energy Icons

[energyicons.com](https://energyicons.com)

Open-source icons for the energy transition: 1,000 icons covering solar, wind, hydro, grid, storage, EV charging, heat pumps, industry, climate, and the everyday interface glyphs around them. Every icon is drawn at two optical sizes in two weights and published as outlined SVGs. MIT licensed.

```bash
npm install energy-icons
```

```tsx
import { Icon } from "energy-icons/icon";

<Icon name="pylon" size={32} weight="bold" />
```

Import one icon when the bundle should stay small: `import { Pylon } from "energy-icons/icons/pylon"`. Sizes below 32 use the 20px master. Sizes from 32 up use the 48px master. See [Installation](src/app/docs/installation/page.tsx) and [Usage](src/app/docs/usage/page.tsx) in the site, and `packages/energy-icons/README.md`.

The icons are free. [Sponsor the library](https://github.com/sponsors/It-s-Sam) if you want to support the drawing. A Buy Me a Coffee link can be added in `src/config/site.ts` (`links.coffee`) when that page exists.

## Contributing

Icon requests, drawing rules, and how to run the checks are in [CONTRIBUTING.md](CONTRIBUTING.md).

This repo also holds the library website: a Next.js app with search, category filters, a size slider, and a detail view where you can copy or download an SVG.

## Run it

Requires Node 20 or later (see `.nvmrc`).

```bash
npm install        # also generates the icon registry (postinstall)
npm run dev        # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server. Runs `npm run icons` first. |
| `npm run build` / `npm start` | Production build and server. `prebuild` runs `npm run icons`. |
| `npm run icons` | Validates `/icons` against the metadata, then regenerates the registry and the Download all zip. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | `tsc --noEmit`, after generating icons and Next route types. |
| `npm test` | Icon system tests, including the byte-identical path check. |
| `npm run check` | Runs lint, typecheck, test and build in order. |

## The two-master scaling rule

Every icon has two optical masters:

| Master | Grid | Drawn with | Used for |
| --- | --- | --- | --- |
| `20.svg` | 20×20 | 1px stroke | 12, 14, 16, 18, 20, 24, 28 |
| `48.svg` | 48×48 | 2px stroke | 32, 40, 48, 64 |
| `20-bold.svg` | 20×20 | 1.25px stroke (Bold) | 12, 14, 16, 18, 20, 24, 28 |
| `48-bold.svg` | 48×48 | 2.5px stroke (Bold) | 32, 40, 48, 64 |

Every icon comes in two weights, **Regular** and **Bold**. Bold is its own pair of hand-built masters (same construction rules, heavier stroke), never a re-weighted Regular, and the same breakpoint picks its 20 or 48 master. Bold is optional per icon: an icon without both Bold files is shown Regular-only and the Bold switch falls back to Regular for it (`npm run icons` lists any such icons).

**Sizes below 32px use the 20 master. Sizes from 32px up use the 48 master.** The chosen master is scaled proportionally with `width` and `height`. The viewBox stays at the master's own grid.

Hard rules: path data is never edited, stroke widths are never changed, and `non-scaling-stroke` is never used. The SVGs exported from Figma are the source of truth. Copy SVG and Download SVG output the source file with only the root `width`/`height` changed. `npm test` checks that the path data is byte-identical for every icon at every size.

### Where the breakpoint lives

`src/config/icons.ts`:

```ts
export const OPTICAL_MASTER_BREAKPOINT = 32;
```

This one constant controls the `<Icon>` component, the toolbar's master indicator, the detail view, copy and download output, and the size tables in the docs pages. Supported sizes (`SUPPORTED_SIZES`) and the default size (`DEFAULT_ICON_SIZE`) are in the same file.

## Using the component

The website uses an in-repo `<Icon>`. Published apps use the `energy-icons` package described above.

```tsx
import { Icon } from "@/components/icon";

<Icon name="wind-turbine" size={24} />                // decorative (aria-hidden)
<Icon name="pylon" size={40} title="Transmission" />  // labelled (role="img")
<Icon name="solar-panel" className="text-sky-600" />  // inherits currentColor
<Icon name="wind-turbine" size={24} weight="bold" />  // Bold weight (default "regular")
```

- `name` is typed as a union of every known slug, so a typo is a type error.
- The icon renders as inline SVG with `fill="currentColor"`, so it takes on the surrounding text colour.
- The master is picked automatically from `size`. The default size is 32.

## Adding a new icon

1. **Draw both masters in Figma.** Use a 20×20 frame with a 1px stroke and a 48×48 frame with a 2px stroke. Outline the strokes, flatten, and use a single fill. Export each frame as SVG with the full frame as the viewBox.
2. **Add the files** as `icons/<slug>/20.svg` and `icons/<slug>/48.svg`, plus the Bold masters `20-bold.svg` and `48-bold.svg`. The slug is kebab-case, for example `heat-network`. The viewBox must be `0 0 20 20` / `0 0 48 48` and fills should be `currentColor`. Don't hand-edit the paths.
3. **Add one metadata entry** to `src/data/icons.ts`. Its position in the list sets its position in the grid:
   ```ts
   {
     slug: "heat-network",
     name: "Heat network",
     category: "heat-buildings", // any id from src/data/categories.ts
     keywords: ["district heating", "heat network", "pipes"],
   },
   ```
4. **Run `npm run dev`, or `npm run icons` on its own.** The icon now appears in the grid, search, its category filter, the detail view, `<Icon name="heat-network" />` (with type checking) and the Download all zip.

If a metadata entry is missing a file, or a folder in `/icons` has no metadata, `npm run icons` exits with an error that names the problem. Because `dev`, `build`, `typecheck` and `test` all run it first, a broken icon can't slip through. The check also rejects the wrong viewBox, `non-scaling-stroke`, scripts and embedded styles or images. It warns about live strokes, hard-coded fills and `id`s.

Categories with no icons are hidden, and a category's filter appears automatically once it has an icon.

## Architecture

```
icons/<slug>/20.svg, 48.svg      Source masters, exactly as exported from Figma
icons/<slug>/20-bold.svg, 48-bold.svg   Bold masters (optional per icon)
scripts/generate-icons.ts        Validation, registry generation and zip (npm run icons)
src/
  config/icons.ts                Breakpoint, supported sizes, master selection
  config/site.ts                 Site name and GitHub / Figma / sponsor link slots
  data/categories.ts             Site categories and the Figma category mapping
  data/icons.ts                  Typed metadata (slug, name, category, keywords) and the IconName union
  generated/icon-registry.ts     GENERATED: Regular SVG markup keyed by slug and master (gitignored)
  generated/icon-registry-bold.ts  GENERATED: Bold SVG markup, same shape (gitignored)
  generated/icon-registry-*.ts    GENERATED: one browser chunk per weight and master (gitignored)
  lib/icons/                     SVG helpers (withSize), getIconSvg, search and filter
  components/icon.tsx            <Icon> (and <IconMasterSvg> to render a specific master)
  components/library/            Toolbar, grid, detail dialog, state provider
  components/layout/             Sidebar, theme toggle, menu button
  components/docs/               Docs page primitives
  components/hero/               Animated hero (WebGL field, frames) and the floating library stage
  app/                           Routes: /, /category/[category], /docs/*
design/energy-hero-settings.json  Hero field settings exported from Toolcraft
public/downloads/energy-icons.zip  GENERATED at build time for Download all (gitignored)
public/figma/v1/*.json           GENERATED icon data the Figma plugin loads from energyicons.com (gitignored)
packages/figma-plugin/           The Figma plugin (npm run figma), see its README
tests/                           node:test suites run with tsx
```

- **Registry.** The generator reads each SVG and stores the source file once, keyed by slug and master. viewBox and inner markup are derived from that string. `<Icon>` renders the inner markup inside an `<svg>` with the right viewBox and width/height, so rendering never rewrites paths. Copy and download take the full source string and change only the root `width` and `height`. The browser ships the Regular 48 chunk with the page (the default size). The other master of the current weight loads after paint, and Bold loads when that weight is used.
- **Routes.** `/` shows all icons. `/category/<id>` is statically generated for each non-empty category. `/docs/adding-an-icon` and `/docs/design-principles` are plain pages. Search text and grid size live in a client context in the root layout, so they persist as you move between categories.
- **Later.** Adding docs pages means adding routes under `src/app/docs` and a link in `src/components/layout/sidebar.tsx`. GitHub, Figma and sponsor links go in `siteConfig.links` (`src/config/site.ts`), and the sidebar shows a Resources group once any of them are set.

## Releasing

1. Bump `version` in `packages/energy-icons/package.json` (and `siteConfig.version` in `src/config/site.ts`), add a `CHANGELOG.md` entry, and push to `main`. Vercel deploys the site from `main`.
2. Run the **Publish** workflow from the Actions tab. It builds the package and stages it on npm through trusted publishing, with no stored token.
3. Approve the staged version with 2FA, on the package's page at npmjs.com or with `npm stage list` then `npm stage approve <stage-id>`. Until then nothing is installable, so a compromised workflow can't ship a release on its own.

npm then runs its automated review, which can take a while for a large release; the version shows as "Validating" until it finishes.

## The website hero

Every page opens on an animated hero, with the library window floating below it. The window locks in place when it reaches the top of the viewport, and internal links point at `#icons` so moving between pages keeps it in view.

The hero's dot, energy and glow field is a WebGL shader adapted from Toolcraft. Its settings live in `design/energy-hero-settings.json`. In development, DialKit panels (bottom right) tune the hero layout, the field and the library stage live. Use a panel's Copy button, then paste the values into `src/components/hero/hero-dials.ts` or `library-stage.tsx`, or into the settings JSON. Production builds swap DialKit for a stub that returns each dial's default (`next.config.ts`), so the panels never ship.

The site lives at [energyicons.com](https://energyicons.com), set in `src/config/site.ts` and used for social previews, the sitemap and robots.txt. `NEXT_PUBLIC_SITE_URL` overrides it, for example on a staging domain.

## License

MIT, copyright Sam Passmore (ItsSam); see [LICENSE](LICENSE). Free for personal and commercial use, and no attribution is required. Keep the `LICENSE` file when you redistribute the icon files. The npm package and the Download all zip include it.

Icons are drawn in Figma by Sam, and extended with Claude working from the same construction rules and grid. Every icon is reviewed and finalised by hand.

A few icons depict symbols associated with trademarks, such as Bluetooth, USB, Wi-Fi, CCS and CHAdeMO. Those marks belong to their owners, and their inclusion implies no affiliation or endorsement.

The website includes third-party work (the Toolcraft hero renderer, the GitHub mark, and the Montserrat and Geist Mono fonts), credited in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Security issues: see [SECURITY.md](SECURITY.md).
