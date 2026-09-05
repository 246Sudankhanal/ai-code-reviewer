import type { MetadataRoute } from "next";
import { APP_DOMAIN } from "@/lib/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  const host = `https://${APP_DOMAIN}`;
  const paths = ["", "/contact", "/privacy", "/terms"];
  return paths.map((path) => ({
    url: `${host}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
