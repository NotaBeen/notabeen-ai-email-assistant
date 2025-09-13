import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["notabeen.com"],
    remotePatterns: [],
  },

  transpilePackages: ["@mui/material", "@mui/system", "@mui/icons-material"],

  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@mui/material": "@mui/material",
      "@mui/system": "@mui/system",
      "@mui/icons-material": "@mui/icons-material",
    };
    return config;
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self'; style-src 'self' 'https://fonts.googleapis.com' 'https://fonts.gstatic.com'; img-src 'self';`,
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "no-referrer",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=()",
          },
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, private",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
