import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/admin/", "/api/"],
    },
    sitemap: "https://daxerly.vercel.app/sitemap.xml",
  };
}
