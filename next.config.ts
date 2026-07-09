import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "cdn.setneg.go.id",
      },
      {
        protocol: "https",
        hostname: "www.antaranews.com",
      },
      {
        protocol: "https",
        hostname: "img.antaranews.com",
      },
      {
        protocol: "https",
        hostname: "www.jakartafair.co.id",
      },
    ],
  },
};

export default nextConfig;
