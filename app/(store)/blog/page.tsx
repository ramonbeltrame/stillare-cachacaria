import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BlogListClient } from "./blog-list-client";

export const metadata: Metadata = {
  title: "Blog — Cachaça Stillare | Artigos, Receitas e Curiosidades",
  description: "Descubra o universo da cachaça artesanal. Artigos sobre produção, envelhecimento, harmonização e curiosidades da cachaça Stillare.",
};

export default async function BlogPage() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 12,
    });

    return <BlogListClient initialPosts={JSON.parse(JSON.stringify(posts))} />;
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#120a04" }}>
        <p className="text-amber-100/40">Erro ao carregar blog.</p>
      </div>
    );
  }
}
