import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    /** Keeps Turbopack rooted in this app when other lockfiles exist on the machine. */
    root: process.cwd(),
  },
};

export default nextConfig;
