"use client";

import { useState } from "react";
import { Search, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/store/BlogCard";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  author: string;
  category: string | null;
  publishedAt: string | null;
}

export function BlogListClient({ initialPosts }: { initialPosts: Post[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  const filteredPosts = initialPosts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.excerpt && p.excerpt.toLowerCase().includes(search.toLowerCase())) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div style={{ backgroundColor: "#120a04" }}>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl text-amber-100 mb-4">Blog Stillare</h1>
          <p className="text-amber-100/50 font-light max-w-2xl mx-auto leading-relaxed">
            Descubra o universo da cachaça artesanal. Artigos, receitas, harmonizações e muito mais sobre a cultura da nossa bebida.
          </p>
        </div>

        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-100/30" />
            <Input
              placeholder="Buscar no blog..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 bg-[#1a0f07] border-amber-500/20 text-amber-100 placeholder:text-amber-100/30"
            />
          </div>
        </div>

        {paginatedPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FileText className="h-12 w-12 text-amber-500/20 mb-4" />
            <h2 className="text-xl font-semibold text-amber-100 mb-2">Nenhum post encontrado</h2>
            <p className="text-amber-100/40">
              {search ? "Tente ajustar sua busca." : "Em breve publicaremos novos conteúdos."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  slug={post.slug}
                  title={post.title}
                  excerpt={post.excerpt}
                  coverImage={post.coverImage}
                  publishedAt={post.publishedAt}
                  category={post.category}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-amber-500/20 text-amber-100/60 hover:text-amber-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-amber-100/60 px-4">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-amber-500/20 text-amber-100/60 hover:text-amber-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
