import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server-side rendering için export modunu kaldırdık
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
