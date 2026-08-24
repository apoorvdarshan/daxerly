import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://daxerly.aopv.dev",
      lastModified: new Date(),
    },
    {
      url: "https://daxerly.aopv.dev/privacy",
      lastModified: new Date(),
    },
    {
      url: "https://daxerly.aopv.dev/tos",
      lastModified: new Date(),
    },
  ];
}
