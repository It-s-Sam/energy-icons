import type { CategoryId } from "@/data/categories";

export const categoryHref = (id: CategoryId) => `/category/${id}`;

/** Every page renders under the hero; this links to a page scrolled to its library stage. */
export const inLibrary = (path: string) => `${path}#icons`;
