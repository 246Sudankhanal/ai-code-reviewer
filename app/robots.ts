import type { MetadataRoute } from "next";
import { APP_DOMAIN } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  const host = `https://${APP_DOMAIN}`;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api/"],
    },
    sitemap: `${host}/sitemap.xml`,
    host,
  };
}
