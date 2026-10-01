# energy-icons

Open-source icons for the energy transition. MIT licensed. Browse them all at [energyicons.com](https://energyicons.com).

```bash
npm install energy-icons
```

React 18 or newer is required.

```tsx
import { Icon } from "energy-icons/icon";

<Icon name="pylon" size={32} weight="bold" />
```

That import includes every icon. To ship a single drawing:

```tsx
import { Pylon } from "energy-icons/icons/pylon";

<Pylon size={32} />
```

Sizes below 32 use the 20px master. Sizes from 32 up use the 48px master. `weight` is `"regular"` (the default) or `"bold"`. Icons inherit `currentColor`.

SVG files ship in the package at `energy-icons/svg/<slug>/`.

Support the work at [ko-fi.com/energyicons](https://ko-fi.com/energyicons).

## License

MIT. Free for personal and commercial use, with no attribution required. Keep the `LICENSE` file if you redistribute the icon files. Trademark notes are in the [project README](https://github.com/Sam-r-passmore/energy-icons#license).
