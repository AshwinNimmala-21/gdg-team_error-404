import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Cloud Run Docker image.
  output: "standalone",
  // Loaded with Node require at runtime instead of being bundled (gRPC + protobuf files).
  serverExternalPackages: ["@google-cloud/firestore"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
