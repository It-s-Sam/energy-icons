import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { GeistMono } from "geist/font/mono";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

import { Hero } from "@/components/hero/hero";
import { AppFrame } from "@/components/layout/app-frame";
import { Sidebar } from "@/components/layout/sidebar";
import { themeInitScript } from "@/components/layout/theme";
import { LibraryProvider } from "@/components/library/library-provider";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} — energy transition icons`, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#141413" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="text-[13px]">
        <LibraryProvider>
          <AppFrame hero={<Hero />}>
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col bg-main">{children}</div>
          </AppFrame>
        </LibraryProvider>
      </body>
    </html>
  );
}
