import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BlogDetailClient } from "./blog-detail-client";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.stillare.com.br";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
      select: { title: true, excerpt: true, coverImage: true },
    });

    if (!post) {
      return { title: "Post não encontrado", robots: { index: false, follow: true } };
    }

    const title = `${post.title} — Blog Stillare`;
    const description = post.excerpt || `Leia ${post.title} no blog da Stillare Cachaçaria.`;
    const imageUrl = post.coverImage ? `${siteUrl}${post.coverImage}` : `${siteUrl}/images/hero/hero-bg.jpeg`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${siteUrl}/blog/${params.slug}`,
        images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
        siteName: "Stillare Cachaçaria",
        locale: "pt_BR",
      },
      twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
      alternates: { canonical: `${siteUrl}/blog/${params.slug}` },
    };
  } catch {
    return { title: "Blog | Stillare Cachaçaria" };
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  try {
    const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });

    if (!post || !post.isPublished) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "#120a04" }}>
          <h1 className="font-display text-3xl text-amber-100 mb-4">Post não encontrado</h1>
          <p className="text-amber-100/40">Este post não está disponível.</p>
        </div>
      );
    }

    const relatedPosts = await prisma.blogPost.findMany({
      where: { isPublished: true, id: { not: post.id }, category: post.category || undefined },
      take: 3,
      orderBy: { publishedAt: "desc" },
    });

    return (
      <BlogDetailClient
        post={JSON.parse(JSON.stringify(post))}
        relatedPosts={JSON.parse(JSON.stringify(relatedPosts))}
      />
    );
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#120a04" }}>
        <p className="text-amber-100/40">Erro ao carregar post.</p>
      </div>
    );
  }
}
