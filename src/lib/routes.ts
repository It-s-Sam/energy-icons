import type { CategoryId } from "@/data/categories";

export const categoryHref = (id: CategoryId) => `/category/${id}`;

/** The id of the library stage every page renders under the hero. */
export const LIBRARY_ANCHOR = "icons";

/** Links to a page scrolled to its library stage. Prefer <LibraryLink> for in-app links. */
export const inLibrary = (path: string) => `${path}#${LIBRARY_ANCHOR}`;
