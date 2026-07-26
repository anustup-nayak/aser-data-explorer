import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{
    url: SITE_URL,
    lastModified: new Date("2026-07-26T00:00:00+05:30"),
    changeFrequency: "monthly",
    priority: 1,
  }];
}
