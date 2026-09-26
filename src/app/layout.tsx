import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { Sidebar } from "@/components/layout/sidebar";
import { themeInitScript } from "@/components/layout/theme";
import { LibraryProvider } from "@/components/library/library-provider";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `${siteConfig.name} — energy transition icons`, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#141413" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="h-dvh overflow-hidden text-[13px]">
        <LibraryProvider>
          <div className="flex h-dvh">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col bg-bg">{children}</div>
          </div>
        </LibraryProvider>
      </body>
    </html>
  );
}
