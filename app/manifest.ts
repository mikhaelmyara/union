import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UNION",
    short_name: "UNION",
    description: "Plateforme de campagnes, leads, partenaires et récompenses",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F8FC",
    theme_color: "#4F46E5",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
