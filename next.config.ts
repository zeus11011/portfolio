import type { NextConfig } from "next";

// GitHub Pages serves project sites from /<repo>; the deploy workflow sets this. Empty locally.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export", // static site in out/, no server needed
  basePath,
  trailingSlash: true, // out/index.html style paths, which GitHub Pages serves directly
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
