import type { NextConfig } from "next";

/*
 * DialKit's tuning panels are a development tool. Production builds swap the
 * package for a stub that returns each dial's default, so DialKit and Motion
 * never ship to visitors (see src/lib/dialkit/production-stub.ts).
 */
const dialkitAliases: Record<string, string> =
  process.env.NODE_ENV === "production"
    ? {
        dialkit: "./src/lib/dialkit/production-stub.ts",
        "dialkit/styles.css": "./src/lib/dialkit/production-stub.css",
      }
    : {};

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: dialkitAliases,
  },
  async headers() {
    return [
      {
        // Icon data for the Figma plugin. Plugin UIs run in a sandboxed iframe with
        // a null origin, so the files must allow any origin. Not fingerprinted, so
        // cache for an hour: new icons reach the plugin shortly after a deploy.
        source: "/figma/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
