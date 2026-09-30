import Link from "next/link";

import { inLibrary } from "@/lib/routes";

export default function NotFound() {
  return (
    <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-[15px] font-medium text-fg">Page not found</h1>
      <p className="max-w-sm text-[13px] text-fg-muted">That page doesn’t exist. The icon may have been renamed, or the link is out of date.</p>
      <Link href={inLibrary("/")} className="h-8 rounded-md bg-primary px-3 text-[13px] leading-8 text-primary-fg hover:bg-primary-hover">
        Browse all icons
      </Link>
    </main>
  );
}
