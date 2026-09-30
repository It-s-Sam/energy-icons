import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { DOCS_PAGES } from "@/data/docs";
import { getNonEmptyCategories } from "@/lib/icons/filter";
import { categoryHref } from "@/lib/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", ...getNonEmptyCategories().map((category) => categoryHref(category.id)), ...DOCS_PAGES.map((doc) => doc.href)];
  return paths.map((path) => ({ url: `${siteConfig.url}${path}` }));
}
