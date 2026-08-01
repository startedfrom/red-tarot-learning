import type { MetadataRoute } from "next";
import { allCards } from "./data/cards";
import { guides } from "./data/guides";
import { publicReadings } from "./lib/public-content";
import { getSiteUrl } from "./lib/site-url";

const updated = new Date("2026-08-02T00:00:00+09:00");

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const paths = ["/", "/cards", ...allCards.map((card) => `/cards/${card.id}`), "/readings", ...publicReadings.map((reading) => `/readings/${reading.id}`), "/guides", ...guides.map((guide) => `/guides/${guide.slug}`)];
  return paths.map((path) => {
    const changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = path === "/" ? "weekly" : "monthly";
    return { url: `${base}${path}`, lastModified: updated, changeFrequency, priority: path === "/" ? 1 : path.split("/").length === 2 ? 0.8 : 0.7 };
  });
}
