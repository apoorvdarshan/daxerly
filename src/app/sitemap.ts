import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://daxerly.apoorvdarshan.com",
      lastModified: new Date(),
    },
    {
      url: "https://daxerly.apoorvdarshan.com/privacy",
      lastModified: new Date(),
    },
    {
      url: "https://daxerly.apoorvdarshan.com/tos",
      lastModified: new Date(),
    },
  ];
}
