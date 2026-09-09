import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/profile/", "/login"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://seven-appreciation.vercel.app"}/sitemap.xml`,
  };
}