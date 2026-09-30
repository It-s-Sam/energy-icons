/**
 * Energy Icons for Figma: main thread.
 *
 * Builds an icon as a frame named "<slug> / <size> / <Weight>" holding the
 * vector, sized exactly and tinted by replacing the master's `currentColor`.
 * The SVG path data is inserted as drawn. Only the root size and fill colour
 * change, the same rule the website and npm package follow.
 */
import type { IconPlacement, MainToUi, Preferences, UiToMain } from "./messages";

const PREFERENCES_KEY = "preferences";

figma.showUI(__html__, { width: 360, height: 580, themeColors: true, title: "Energy Icons" });

function toSvg(placement: IconPlacement): string {
  const { master, size, body, color } = placement;
  const tinted = body.replace(/currentColor/g, color);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${master} ${master}" fill="none">${tinted}</svg>`;
}

function createIcon(placement: IconPlacement): FrameNode {
  const frame = figma.createNodeFromSvg(toSvg(placement));
  const weight = placement.weight === "bold" ? "Bold" : "Regular";
  frame.name = `${placement.slug} / ${placement.size} / ${weight}`;
  frame.fills = [];
  frame.clipsContent = false;
  // Resizing the frame scales the drawing with it.
  for (const child of frame.children) {
    if ("constraints" in child) child.constraints = { horizontal: "SCALE", vertical: "SCALE" };
  }
  frame.setPluginData("slug", placement.slug);
  frame.setPluginData("weight", placement.weight);
  return frame;
}

type Container = BaseNode & ChildrenMixin;

/** A selected frame, group or section the icon can go inside; otherwise null. */
function selectedContainer(): (Container & SceneNode) | null {
  const [node] = figma.currentPage.selection;
  if (figma.currentPage.selection.length !== 1 || !node) return null;
  if (node.type === "FRAME" || node.type === "COMPONENT" || node.type === "SECTION") return node;
  return null;
}

function insert(placement: IconPlacement): void {
  const icon = createIcon(placement);
  const target = selectedContainer();
  if (target) {
    target.appendChild(icon);
    const autoLayout = "layoutMode" in target && target.layoutMode !== "NONE";
    if (!autoLayout) {
      icon.x = Math.round((target.width - icon.width) / 2);
      icon.y = Math.round((target.height - icon.height) / 2);
    }
  } else {
    const { center } = figma.viewport;
    icon.x = Math.round(center.x - icon.width / 2);
    icon.y = Math.round(center.y - icon.height / 2);
  }
  figma.currentPage.selection = [icon];
}

async function drop(placement: IconPlacement, event: DropEvent): Promise<void> {
  // With dynamic page loading, a PageNode handed over by the event must be loaded
  // before it can take children. Drops land on the page in view, which always is.
  let parent: Container;
  if (event.node.type !== "PAGE") {
    parent = event.node as Container;
  } else if (event.node.id === figma.currentPage.id) {
    parent = figma.currentPage;
  } else {
    await event.node.loadAsync();
    parent = event.node;
  }
  const icon = createIcon(placement);
  parent.appendChild(icon);
  icon.x = Math.round(event.x - icon.width / 2);
  icon.y = Math.round(event.y - icon.height / 2);
  figma.currentPage.selection = [icon];
}

// Dragging a tile out of the plugin window drops the icon where it lands.
figma.on("drop", (event: DropEvent) => {
  const placement = event.dropMetadata as IconPlacement | undefined;
  if (!placement?.body) return true;
  drop(placement, event).catch((error: unknown) => {
    figma.notify(`Couldn’t drop the icon: ${error instanceof Error ? error.message : String(error)}`, { error: true });
  });
  return false;
});

figma.ui.onmessage = async (message: UiToMain) => {
  switch (message.type) {
    case "insert":
      insert(message.placement);
      break;
    case "save-preferences":
      await figma.clientStorage.setAsync(PREFERENCES_KEY, message.preferences);
      break;
    case "notify":
      figma.notify(message.message, { error: message.error });
      break;
  }
};

void figma.clientStorage.getAsync(PREFERENCES_KEY).then((preferences: Preferences | undefined) => {
  const reply: MainToUi = { type: "preferences", preferences: preferences ?? null };
  figma.ui.postMessage(reply);
});
