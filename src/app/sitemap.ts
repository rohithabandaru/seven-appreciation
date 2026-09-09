import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://seven-appreciation.vercel.app";

const staticPages = [
  "",
  "/community",
  "/appreciation",
  "/stories",
  "/live",
  "/binder",
  "/achievements",
  "/members",
  "/members/heeseung",
  "/members/jay",
  "/members/jake",
  "/members/sunghoon",
  "/members/sunoo",
  "/members/jungwon",
  "/members/ni-ki",
  "/guidelines",
  "/privacy",
  "/copyright",
  "/community/engene-love",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date();

  return [
    {
      url: baseUrl,
      lastModified: today,
      changeFrequency: "daily",
      priority: 1,
    },
    ...staticPages.slice(1).map((page) => ({
      url: `${baseUrl}${page}`,
      lastModified: today,
      changeFrequency: page.startsWith("/members") ? ("weekly" as const) : ("daily" as const),
      priority: page.startsWith("/members/") ? 0.9 : page === "/live" || page === "/binder" ? 0.8 : 0.6,
    })),
  ];
}