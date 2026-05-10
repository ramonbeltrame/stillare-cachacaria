"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slugify } from "@/lib/utils";
import toast from "react-hot-toast";

function BlogPostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [author, setAuthor] = useState("Stillare");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!editSlug);

  useEffect(() => {
    if (editSlug) {
      fetch(`/api/blog/${editSlug}`)
        .then((res) => {
          if (!res.ok) throw new Error("Não encontrado");
          return res.json();
        })
        .then((data) => {
          const post = data.post;
          setTitle(post.title);
          setSlug(post.slug);
          setExcerpt(post.excerpt || "");
          setContent(post.content);
          setCoverImage(post.coverImage || "");
          setAuthor(post.author || "Stillare");
          setCategory(post.category || "");
          setTags(post.tags || "");
          setIsPublished(post.isPublished);
        })
        .catch(() => {
          toast.error("Erro ao carregar post");
          router.push("/admin/blog");
        })
        .finally(() => setLoading(false));
    }
  }, [editSlug, router]);

  useEffect(() => {
    if (!editSlug && title) {
      setSlug(slugify(title));
    }
  }, [title, editSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) {
      toast.error("Título, slug e conteúdo são obrigatórios");
      return;
    }

    setSubmitting(true);
    try {
      const body = { title, slug, excerpt: excerpt || null, content, coverImage: coverImage || null, author, category: category || null, tags: tags || null, isPublished };

      let res;
      if (editSlug) {
        res = await fetch(`/api/blog/${editSlug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar");
      }

      toast.success(editSlug ? "Post atualizado!" : "Post criado!");
      router.push("/admin/blog");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl animate-pulse">
        <div className="h-8 w-48 bg-amber-500/5 rounded" />
        <div className="h-96 bg-amber-500/5 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-amber-100/60 hover:text-amber-300">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-amber-100">
            {editSlug ? "Editar Post" : "Novo Post"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-xl border border-amber-500/20 bg-[#1a0f07] space-y-4">
          <div>
            <label className="text-amber-100/70 text-sm block mb-1">Título *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do post" className="bg-[#120a04] border-amber-500/30 text-amber-100" />
          </div>
          <div>
            <label className="text-amber-100/70 text-sm block mb-1">Slug *</label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug-do-post" className="bg-[#120a04] border-amber-500/30 text-amber-100 font-mono text-sm" />
          </div>
          <div>
            <label className="text-amber-100/70 text-sm block mb-1">Resumo (excerpt)</label>
            <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className="bg-[#120a04] border-amber-500/30 text-amber-100 resize-none" />
          </div>
          <div>
            <label className="text-amber-100/70 text-sm block mb-1">Conteúdo *</label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={16} className="bg-[#120a04] border-amber-500/30 text-amber-100 font-mono text-sm" placeholder="Escreva o conteúdo em HTML ou texto..." />
          </div>
          <div>
            <label className="text-amber-100/70 text-sm block mb-1">URL da Imagem de Capa</label>
            <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="/images/blog/cover.jpg" className="bg-[#120a04] border-amber-500/30 text-amber-100" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-amber-100/70 text-sm block mb-1">Autor</label>
              <Input value={author} onChange={(e) => setAuthor(e.target.value)} className="bg-[#120a04] border-amber-500/30 text-amber-100" />
            </div>
            <div>
              <label className="text-amber-100/70 text-sm block mb-1">Categoria</label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Cachaça, Curiosidades..." className="bg-[#120a04] border-amber-500/30 text-amber-100" />
            </div>
            <div>
              <label className="text-amber-100/70 text-sm block mb-1">Tags</label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tag1, tag2, tag3" className="bg-[#120a04] border-amber-500/30 text-amber-100" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="rounded border-amber-500/30 bg-[#120a04] text-amber-500" />
              <span className="text-amber-100/70 text-sm">Publicar</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 pb-8">
          <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-black font-medium gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {submitting ? "Salvando..." : editSlug ? "Atualizar Post" : "Criar Post"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()} className="text-amber-100/60 hover:text-amber-300">Cancelar</Button>
        </div>
      </form>
    </div>
  );
}

export default function NewBlogPostPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 max-w-3xl animate-pulse">
        <div className="h-8 w-48 bg-amber-500/5 rounded" />
        <div className="h-96 bg-amber-500/5 rounded-xl" />
      </div>
    }>
      <BlogPostForm />
    </Suspense>
  );
}
