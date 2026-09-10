import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "INU 생활형 계산기",
    short_name: "INU CALC",
    description: "생활에 필요한 계산 10가지를 빠르고 가볍게.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2f0e8",
    theme_color: "#2457ff",
    categories: ["utilities", "productivity"],
    lang: "ko-KR",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
