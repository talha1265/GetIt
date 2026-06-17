import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // A lockfile exists in the parent home directory; pin the workspace root to
  // this project so Turbopack doesn't infer the wrong root.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
