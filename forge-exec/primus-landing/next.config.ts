import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress hydration warnings caused by browser extensions modifying form inputs
  reactStrictMode: true,
};

export default nextConfig;
