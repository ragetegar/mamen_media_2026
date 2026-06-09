import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MAMEN — Indonesian Music & Concert Culture",
    short_name: "MAMEN",
    description: "Your go-to platform for Indonesian music, concert culture, and everything that moves the crowd.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#7B3EFF",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
