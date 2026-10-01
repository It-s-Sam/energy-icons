# Energy Icons for Figma

**Live on Figma Community:** [Energy Icons](https://www.figma.com/community/plugin/1687188347733136771/energy-icons)

Search the set, pick a size, weight and colour, then click an icon (or drag it onto the canvas) to insert it.

- **Size follows the site's rule.** Sizes below 32 insert the 20 master, sizes from 32 up insert the 48 master, scaled to the exact size. Path data is never edited.
- **Inserted as a named frame**, e.g. `wind-turbine / 24 / Regular`, holding the vector. The vector scales with the frame, and the colour is its fill.
- **Clicking** places the icon in the centre of the view, or in the centre of a selected frame, component or section (in auto layout, it joins the flow). **Dragging** drops it where you release.
- Size, weight and colour are remembered between sessions.
- **Always current.** The plugin loads icons from `energyicons.com/figma/v1/`, which the site build generates (`scripts/generate-icons.ts`). New icons appear once the site deploys, with no plugin update.

## Build

From the repo root:

```bash
npm run figma       # production: loads icons from https://energyicons.com
npm run figma:dev   # development: loads icons from http://localhost:3000 (run `npm run dev`)
```

Both write `dist/code.js` and `dist/ui.html`, which `manifest.json` points at.

## Try it in Figma

1. In the Figma desktop app: **Plugins → Development → Import plugin from manifest…** and pick `packages/figma-plugin/manifest.json`.
2. Run it from **Plugins → Development → Energy Icons**.
3. After a rebuild, close and reopen the plugin to load the new `dist/`.

`manifest.json` carries the published plugin ID (`1687188347733136771`), so local builds and published updates are the same plugin. Keep it unchanged.

## Publish

1. `npm run figma` (the production build: check the log says `energyicons.com`).
2. In Figma: **Plugins → Development → Manage plugins in development → Energy Icons → Publish**. Updates publish to the same listing because the ID in `manifest.json` matches.
3. Listing assets are in `assets/`: `icon-128.png` (plugin icon) and `cover-1920x960.png` (cover art).
4. Suggested listing:
   - **Tagline:** 1,000 open-source icons for energy, climate and infrastructure.
   - **Description:** Energy Icons is a free, MIT-licensed icon set with deep coverage for solar, wind, grid, storage, EV charging, heat and climate, plus the everyday interface icons around them. Every icon is drawn at two optical sizes in Regular and Bold. Pick a size and the right master is used automatically. Search, filter by category, choose a colour, and click or drag to insert. Browse the full set at energyicons.com.
   - **Tags:** icons, energy, climate, sustainability, iconography
   - **Network access:** energyicons.com, to load the icon list and artwork.

Figma reviews new plugins before they go live. Updates to the icon set don't need a new plugin version; changes to the plugin's code do.
