# Contributing

Energy Icons is drawn by hand. Code scales the masters. It does not redraw them.

## Ask for an icon

Open an [icon request](https://github.com/It-s-Sam/energy-icons/issues/new?template=icon_request.yml). Include what the symbol needs to depict. A sponsor does not jump the queue. The icons stay free either way.

## Draw an icon

1. Draw a 20×20 master with a 1px stroke and a 48×48 master with a 2px stroke. Outline the strokes, flatten, and use one `currentColor` fill. Export each frame as SVG with the full frame as the viewBox.
2. Draw Bold the same way: 1.25px at 20, 2.5px at 48.
3. Add `icons/<slug>/20.svg`, `48.svg`, `20-bold.svg`, and `48-bold.svg`. The slug is kebab-case.
4. Add one entry to `src/data/icons.ts`. Its position in the list is its position in the grid.
5. Run `npm test`. The check fails if a file is missing, the viewBox is wrong, or the path data was edited outside the source file.

Do not hand-edit path data, stroke widths, or add `non-scaling-stroke`. Fixes to a drawing happen in the source file, then the SVG is replaced.

Open a pull request from a fork. The maintainer reviews every icon for drawing quality, consistency with the set, and a clear meaning, and nothing ships until it's merged. By contributing you confirm the icon is your own work and release it under the project's [MIT License](LICENSE). Please don't submit drawings traced from other icon sets, or logos you don't have the right to share.

## Work on the website or the package

Node 20 or newer.

```bash
npm install
npm run dev
```

`npm run check` runs lint, types, tests, the package build, and the site build. `npm run package` writes `packages/energy-icons` from `/icons`.

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md).
