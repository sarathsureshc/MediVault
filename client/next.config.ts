import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for faster development builds
  experimental: {
    // Use Turbopack for faster builds (already enabled by default in Next 16 with --turbo flag)
    // Optimize module imports
    optimizePackageImports: ["lucide-react", "framer-motion"],
    // Use less memory during builds
    memoryBasedWorkersCount: true,
  },

  // Enable SWC minification for production

  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    // Reduce image optimization time in dev
    unoptimized: process.env.NODE_ENV === "development",
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Optimize font loading
};

export default nextConfig;
