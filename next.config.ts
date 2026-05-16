import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    /** Keeps Turbopack rooted in this app when other lockfiles exist on the machine. */
    root: process.cwd(),
  },
};

export default nextConfig;
