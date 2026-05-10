import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Stillare Cacha\u00e7aria - Cacha\u00e7a Artesanal Premium",
    short_name: "Stillare",
    description:
      "Cacha\u00e7a artesanal premium envelhecida em barris de carvalho. Compre online.",
    start_url: "/",
    display: "standalone",
    background_color: "#120a04",
    theme_color: "#d4a853",
    icons: [
      { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
  };
}
