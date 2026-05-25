import type { MetadataRoute } from "next";
import { absoluteUrl, categories } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["/", "/play", "/leaderboard", ...categories.map((category) => `/${category.slug}`)];

  return routes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: now,
    changeFrequency: route === "/" || route === "/play" ? "daily" : "weekly",
    priority: route === "/" ? 1 : route === "/play" ? 0.9 : 0.7
  }));
}
