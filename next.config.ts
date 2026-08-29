import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained Node server (server.js) for Docker/VPS hosting.
  output: "standalone",
};

export default nextConfig;
