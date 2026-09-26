import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IconBrowser } from "@/components/library/icon-browser";
import { CATEGORY_LABELS, isCategoryId } from "@/data/categories";
import { getNonEmptyCategories } from "@/lib/icons/filter";

// Only categories that contain icons get a page; empty ones 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getNonEmptyCategories().map((category) => ({ category: category.id }));
}

export async function generateMetadata({ params }: PageProps<"/category/[category]">): Promise<Metadata> {
  const { category } = await params;
  return { title: isCategoryId(category) ? CATEGORY_LABELS[category] : "Not found" };
}

export default async function CategoryPage({ params }: PageProps<"/category/[category]">) {
  const { category } = await params;
  if (!isCategoryId(category)) notFound();
  return <IconBrowser category={category} />;
}
