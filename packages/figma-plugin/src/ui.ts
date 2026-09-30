/**
 * Energy Icons for Figma: plugin UI.
 *
 * Loads the icon list and one master's artwork at a time from energyicons.com
 * (see scripts/generate-icons.ts → public/figma/v1), so new icons appear here as
 * soon as the site deploys. The master follows the site's rule: sizes below the
 * breakpoint use the 20 master, sizes from it up use the 48 master.
 */
import type { IconPlacement, IconWeight, MainToUi, Preferences, UiToMain } from "./messages";

/** Set at build time: energyicons.com, or localhost:3000 for `npm run figma:dev`. */
declare const __DATA_URL__: string;

type IconEntry = { slug: string; name: string; category: string; keywords: string[]; bold: boolean };
type IconIndex = {
  version: string;
  breakpoint: number;
  masters: number[];
  sizes: number[];
  categories: { id: string; label: string }[];
  icons: IconEntry[];
};
type Bodies = Record<string, string>;

const DEFAULTS: Preferences = { size: 24, weight: "regular", color: "#000000" };

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const searchInput = $<HTMLInputElement>("search");
const categorySelect = $<HTMLSelectElement>("category");
const weightGroup = $<HTMLDivElement>("weight");
const sizeSelect = $<HTMLSelectElement>("size");
const colorPicker = $<HTMLInputElement>("color-picker");
const colorHex = $<HTMLInputElement>("color-hex");
const hint = $<HTMLSpanElement>("hint");
const grid = $<HTMLDivElement>("grid");
const count = $<HTMLSpanElement>("count");

const state = {
  index: null as IconIndex | null,
  bodies: new Map<string, Promise<Bodies>>(),
  query: "",
  category: "all",
  preferences: { ...DEFAULTS },
  renderToken: 0,
};

const post = (message: UiToMain) => parent.postMessage({ pluginMessage: message }, "*");

async function fetchJson<T>(file: string): Promise<T> {
  const response = await fetch(`${__DATA_URL__}/${file}`);
  if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
  return (await response.json()) as T;
}

function masterFor(size: number): number {
  const index = state.index;
  if (!index) return 20;
  return size < index.breakpoint ? index.masters[0] : index.masters[index.masters.length - 1];
}

/** Bold falls back to Regular for any icon drawn without it. */
function weightFor(icon: IconEntry): IconWeight {
  return state.preferences.weight === "bold" && icon.bold ? "bold" : "regular";
}

function loadBodies(weight: IconWeight, master: number): Promise<Bodies> {
  const key = `${weight}-${master}`;
  let pending = state.bodies.get(key);
  if (!pending) {
    pending = fetchJson<Bodies>(`${key}.json`);
    // Let a failed load be retried.
    pending.catch(() => state.bodies.delete(key));
    state.bodies.set(key, pending);
  }
  return pending;
}

function matches(icon: IconEntry, terms: string[]): boolean {
  if (state.category !== "all" && icon.category !== state.category) return false;
  if (terms.length === 0) return true;
  const haystack = `${icon.name} ${icon.slug} ${icon.keywords.join(" ")}`.toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function showMessage(text: string, retry = false): void {
  grid.innerHTML = `<div class="message" role="status">${text}${retry ? '<br /><button type="button" id="retry">Try again</button>' : ""}</div>`;
  if (retry) $("retry").addEventListener("click", () => void start());
}

async function render(): Promise<void> {
  const index = state.index;
  if (!index) return;
  const token = ++state.renderToken;
  const { size, weight } = state.preferences;
  const master = masterFor(size);
  hint.innerHTML = `<b>${master}</b> master`;

  const terms = state.query.toLowerCase().split(/\s+/).filter(Boolean);
  const results = index.icons.filter((icon) => matches(icon, terms));
  count.textContent = `${results.length} of ${index.icons.length} icons`;
  if (results.length === 0) {
    showMessage(`No icons match “${escapeAttribute(state.query)}”.`);
    return;
  }

  let regular: Bodies;
  let bold: Bodies | null;
  try {
    [regular, bold] = await Promise.all([
      loadBodies("regular", master),
      weight === "bold" ? loadBodies("bold", master) : Promise.resolve(null),
    ]);
  } catch {
    if (token === state.renderToken) showMessage("Couldn’t load the icons. Check your connection.", true);
    return;
  }
  if (token !== state.renderToken) return;

  grid.innerHTML = results
    .map((icon) => {
      const body = (weightFor(icon) === "bold" ? bold?.[icon.slug] : undefined) ?? regular[icon.slug] ?? "";
      const label = escapeAttribute(icon.name);
      return `<button type="button" class="tile" role="listitem" draggable="true" data-slug="${icon.slug}" title="${label}" aria-label="${label}"><svg viewBox="0 0 ${master} ${master}" fill="none" aria-hidden="true">${body}</svg></button>`;
    })
    .join("");
}

async function placementFor(slug: string): Promise<IconPlacement | null> {
  const icon = state.index?.icons.find((entry) => entry.slug === slug);
  if (!icon) return null;
  const { size, color } = state.preferences;
  const master = masterFor(size);
  const weight = weightFor(icon);
  const body = (await loadBodies(weight, master))[slug];
  if (!body) return null;
  return { slug, name: icon.name, weight, size, master, body, color };
}

function savePreferences(): void {
  post({ type: "save-preferences", preferences: state.preferences });
}

function setWeight(weight: IconWeight): void {
  state.preferences.weight = weight;
  for (const button of weightGroup.querySelectorAll<HTMLButtonElement>("button")) {
    button.setAttribute("aria-checked", String(button.dataset.weight === weight));
  }
}

function setColor(value: string): boolean {
  const color = value.startsWith("#") ? value : `#${value}`;
  if (!/^#[0-9a-f]{6}$/i.test(color)) return false;
  state.preferences.color = color.toLowerCase();
  colorPicker.value = state.preferences.color;
  colorHex.value = state.preferences.color.toUpperCase();
  return true;
}

function applyPreferences(preferences: Preferences): void {
  state.preferences = { ...DEFAULTS, ...preferences };
  setWeight(state.preferences.weight);
  setColor(state.preferences.color);
  sizeSelect.value = String(state.preferences.size);
}

// ---------- Events ----------

searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
  void render();
});
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && searchInput.value) {
    searchInput.value = "";
    state.query = "";
    void render();
    event.stopPropagation();
  }
});
categorySelect.addEventListener("change", () => {
  state.category = categorySelect.value;
  void render();
});
weightGroup.addEventListener("click", (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-weight]");
  if (!button) return;
  setWeight(button.dataset.weight as IconWeight);
  savePreferences();
  void render();
});
sizeSelect.addEventListener("change", () => {
  state.preferences.size = Number(sizeSelect.value);
  savePreferences();
  void render();
});
colorPicker.addEventListener("input", () => {
  if (setColor(colorPicker.value)) savePreferences();
});
colorHex.addEventListener("change", () => {
  if (setColor(colorHex.value.trim())) savePreferences();
  else colorHex.value = state.preferences.color.toUpperCase();
});

const tileSlug = (event: Event) => (event.target as HTMLElement).closest<HTMLElement>(".tile")?.dataset.slug;

/** Set while a tile is being dragged, so releasing the drag never counts as a click. */
let dragging = false;

grid.addEventListener("click", async (event) => {
  const slug = tileSlug(event);
  if (!slug || dragging) return;
  const placement = await placementFor(slug);
  if (placement) post({ type: "insert", placement });
});

grid.addEventListener("dragstart", (event) => {
  const slug = tileSlug(event);
  if (!slug || !event.dataTransfer) return;
  dragging = true;
  // Some Chromium builds (including Figma's desktop app) only start a drag that carries data.
  event.dataTransfer.setData("text/plain", slug);
  event.dataTransfer.effectAllowed = "copy";
  // Warm the artwork so the drop can be sent the moment the drag ends.
  void placementFor(slug);
});

grid.addEventListener("dragend", async (event) => {
  const slug = tileSlug(event);
  // Let the click that some browsers fire after a drag pass harmlessly first.
  setTimeout(() => {
    dragging = false;
  }, 0);
  if (!slug) return;
  // Released back over the plugin window: not a drop onto the canvas.
  const { clientX: x, clientY: y } = event;
  if (x >= 0 && y >= 0 && x <= window.innerWidth && y <= window.innerHeight) return;
  const placement = await placementFor(slug);
  if (!placement) return;
  parent.postMessage({ pluginDrop: { clientX: x, clientY: y, items: [], dropMetadata: placement } }, "*");
});

window.addEventListener("message", (event: MessageEvent<{ pluginMessage?: MainToUi }>) => {
  const message = event.data.pluginMessage;
  if (message?.type === "preferences" && message.preferences) {
    applyPreferences(message.preferences);
    void render();
  }
});

// ---------- Start ----------

async function start(): Promise<void> {
  showMessage("Loading icons…");
  try {
    const index = await fetchJson<IconIndex>("icons.json");
    state.index = index;
    sizeSelect.innerHTML = index.sizes.map((size) => `<option value="${size}">${size} px</option>`).join("");
    sizeSelect.value = String(index.sizes.includes(state.preferences.size) ? state.preferences.size : DEFAULTS.size);
    state.preferences.size = Number(sizeSelect.value);
    categorySelect.innerHTML =
      `<option value="all">All categories</option>` +
      index.categories.map((category) => `<option value="${category.id}">${escapeAttribute(category.label)}</option>`).join("");
    searchInput.placeholder = `Search ${index.icons.length.toLocaleString("en")} icons…`;
    await render();
  } catch {
    showMessage("Couldn’t load the icons. Check your connection.", true);
  }
}

applyPreferences(DEFAULTS);
void start();
