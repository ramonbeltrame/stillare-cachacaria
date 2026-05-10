import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.stillare.com.br";
  const now = new Date();

  let productUrls: MetadataRoute.Sitemap = [];
  let categoryUrls: MetadataRoute.Sitemap = [];
  let blogUrls: MetadataRoute.Sitemap = [];

  try {
    const { prisma } = await import("@/lib/prisma");
    const [products, categories, blogPosts] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.productCategory.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    productUrls = products.map((p) => ({
      url: `${baseUrl}/produtos/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    categoryUrls = categories.map((c) => ({
      url: `${baseUrl}/produtos?categoria=${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    blogUrls = blogPosts.map((b) => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {}

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/produtos`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/sobre`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contato`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/cadastro`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    ...productUrls,
    ...categoryUrls,
    ...blogUrls,
  ];
}
