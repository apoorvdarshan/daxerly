import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://daxerly.vercel.app",
      lastModified: new Date(),
    },
    {
      url: "https://daxerly.vercel.app/privacy",
      lastModified: new Date(),
    },
    {
      url: "https://daxerly.vercel.app/tos",
      lastModified: new Date(),
    },
  ];
}
