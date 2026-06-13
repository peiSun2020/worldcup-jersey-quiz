import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Homepage for each locale
  for (const locale of locales) {
    entries.push({
      url: `${SITE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}/${l}`])
        ),
      },
    });
  }

  // Add more pages here as you create them
  // Example: character pages, about page, etc.
  // for (const locale of locales) {
  //   entries.push({
  //     url: `${SITE_URL}/${locale}/characters/pikachu`,
  //     lastModified: new Date(),
  //     changeFrequency: 'weekly',
  //     priority: 0.8,
  //   });
  // }

  return entries;
}
