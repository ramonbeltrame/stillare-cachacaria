"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  FileText,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { formatDate, cn } from "@/lib/utils";

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  author: string;
  category: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/blog?admin=true");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const togglePublish = async (post: BlogPostData) => {
    try {
      const res = await fetch(`/api/blog/${post.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !post.isPublished }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar");
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, isPublished: !p.isPublished, publishedAt: !p.isPublished ? new Date().toISOString() : p.publishedAt } : p
        )
      );
      toast.success(post.isPublished ? "Post despublicado" : "Post publicado!");
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const handleDelete = async (post: BlogPostData) => {
    if (!confirm(`Remover "${post.title}"?`)) return;
    try {
      const res = await fetch(`/api/blog/${post.slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao remover");
      toast.success("Post removido");
      fetchPosts();
    } catch {
      toast.error("Erro ao remover post");
    }
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-amber-500/5 rounded" />
        <div className="h-10 w-full bg-amber-500/5 rounded" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-amber-500/5 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-amber-100">Blog</h1>
          <p className="text-amber-100/40 text-sm mt-1">{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/blog/novo">
          <Button className="bg-amber-500 hover:bg-amber-600 text-black font-medium gap-2">
            <Plus className="h-4 w-4" />
            Novo Post
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-100/30" />
        <Input
          placeholder="Buscar por título ou categoria..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-10 bg-[#120a04] border-amber-500/20 text-amber-100 placeholder:text-amber-100/30"
        />
      </div>

      {paginatedPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FileText className="h-12 w-12 text-amber-500/20 mb-4" />
          <h2 className="text-xl font-semibold text-amber-100 mb-2">Nenhum post encontrado</h2>
          <p className="text-amber-100/40 mb-6">
            {search ? "Tente ajustar a busca." : "Comece criando seu primeiro post."}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paginatedPosts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-amber-500/20 bg-[#120a04]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-amber-100 font-medium truncate">{post.title}</span>
                    <Badge className={cn(
                      "text-[10px] border-0",
                      post.isPublished ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"
                    )}>
                      {post.isPublished ? "Publicado" : "Rascunho"}
                    </Badge>
                    {post.category && (
                      <Badge className="bg-amber-500/10 text-amber-400 text-[10px] border-0">{post.category}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-amber-100/30 flex-wrap">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{post.publishedAt ? formatDate(post.publishedAt) : "—"}</span>
                    <span>{post.author}</span>
                    <span className="text-amber-100/20">/{post.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => togglePublish(post)} className={post.isPublished ? "text-yellow-400 hover:text-yellow-300" : "text-emerald-400 hover:text-emerald-300"}>
                    {post.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Link href={`/admin/blog/novo?edit=${post.slug}`}>
                    <Button variant="ghost" size="sm" className="text-amber-300 hover:text-amber-100 hover:bg-amber-500/10">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(post)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="border-amber-500/20 text-amber-100/60 hover:text-amber-300">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-amber-100/60 px-4">Página {page} de {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="border-amber-500/20 text-amber-100/60 hover:text-amber-300">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
