"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  category: string | null;
}

export function BlogCard({ slug, title, excerpt, coverImage, publishedAt, category }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group flex flex-col rounded-xl border border-amber-500/20 bg-[#1a0f07] overflow-hidden transition-all duration-300 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5"
    >
      <div className="relative aspect-[16/9] bg-amber-500/5 overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-4xl font-display text-amber-500/20">STILLARE</span>
          </div>
        )}
        {category && (
          <span className="absolute top-3 left-3 px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-500 text-[#1a0f07]">
            {category}
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-display text-lg text-amber-100 line-clamp-2 leading-tight group-hover:text-amber-300 transition-colors">
          {title}
        </h3>
        {excerpt && (
          <p className="text-amber-100/50 text-sm leading-relaxed line-clamp-3 flex-1">
            {excerpt}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-amber-500/10">
          <div className="flex items-center gap-1.5 text-xs text-amber-100/40">
            <Calendar className="h-3 w-3" />
            {publishedAt ? formatDate(publishedAt) : "—"}
          </div>
          <span className="flex items-center gap-1 text-xs text-amber-400 group-hover:text-amber-300 transition-colors">
            Ler mais
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
