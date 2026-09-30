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
};

export default nextConfig;
