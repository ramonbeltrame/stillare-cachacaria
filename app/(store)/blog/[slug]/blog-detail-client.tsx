"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { BlogCard } from "@/components/store/BlogCard";
import { formatDate } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  author: string;
  category: string | null;
  tags: string | null;
  publishedAt: string | null;
}

export function BlogDetailClient({ post, relatedPosts }: { post: Post; relatedPosts: Post[] }) {
  return (
    <div style={{ backgroundColor: "#120a04" }}>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/blog" className="inline-flex items-center gap-2 text-amber-100/50 hover:text-amber-300 text-sm mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Blog
        </Link>

        {post.coverImage && (
          <div className="relative aspect-[21/9] rounded-xl overflow-hidden mb-8 border border-amber-500/20">
            <Image src={post.coverImage} alt={post.title} fill sizes="(max-width: 1024px) 100vw, 900px" className="object-cover" priority />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-amber-100/40 mb-6">
          {post.category && (
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              {post.category}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {post.author}
          </span>
          {post.publishedAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.publishedAt)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {Math.max(1, Math.ceil(post.content.length / 1200))} min de leitura
          </span>
        </div>

        <h1 className="font-display text-3xl md:text-4xl text-amber-100 leading-tight mb-6">{post.title}</h1>

        {post.excerpt && (
          <p className="text-amber-100/60 text-lg font-light leading-relaxed mb-8 border-l-2 border-amber-500/30 pl-4">
            {post.excerpt}
          </p>
        )}

        <div className="prose prose-invert prose-amber max-w-none mb-12">
          <div
            className="text-amber-100/80 leading-relaxed space-y-4 text-base"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br />") }}
          />
        </div>

        {post.tags && (
          <div className="flex flex-wrap items-center gap-2 mb-12">
            {post.tags.split(",").map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-md bg-amber-500/5 text-amber-100/50 text-xs border border-amber-500/10">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        <div className="border-t border-amber-500/20 pt-12">
          <h2 className="font-display text-2xl text-amber-100 mb-6">Posts Relacionados</h2>
          {relatedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rp) => (
                <BlogCard
                  key={rp.id}
                  slug={rp.slug}
                  title={rp.title}
                  excerpt={rp.excerpt}
                  coverImage={rp.coverImage}
                  publishedAt={rp.publishedAt}
                  category={rp.category}
                />
              ))}
            </div>
          ) : (
            <p className="text-amber-100/40 text-sm">Nenhum post relacionado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
