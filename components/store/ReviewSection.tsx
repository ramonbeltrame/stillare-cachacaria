"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Star, User, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface ReviewData {
  id: string;
  userName: string;
  rating: number;
  title: string | null;
  comment: string;
  createdAt: string;
}

interface ReviewsResponse {
  reviews: ReviewData[];
  total: number;
  pages: number;
  averageRating: number;
  totalRatings: number;
  distribution: Record<number, number>;
}

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-6 w-6" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            star <= rating
              ? "text-amber-400 fill-amber-400"
              : star <= Math.ceil(rating) && rating % 1 !== 0
              ? "text-amber-400 fill-amber-400/50"
              : "text-amber-500/20"
          )}
        />
      ))}
    </div>
  );
}

interface ReviewSectionProps {
  productId: string;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [distribution, setDistribution] = useState<Record<number, number>>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews?page=${page}&limit=5`);
      if (res.ok) {
        const data: ReviewsResponse = await res.json();
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalRatings(data.totalRatings);
        setDistribution(data.distribution);
        setTotalPages(data.pages);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [productId, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Escreva um comentário");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: newRating,
          title: newTitle || null,
          comment: newComment.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar");
      }
      toast.success("Avaliação enviada!");
      setNewTitle("");
      setNewComment("");
      setNewRating(5);
      setPage(1);
      await fetchReviews();
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar avaliação");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-32 rounded bg-amber-500/5" />
        <div className="h-20 rounded-lg bg-amber-500/5" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="sm:w-48 shrink-0 text-center">
          <div className="text-5xl font-bold text-amber-400 mb-2">
            {averageRating.toFixed(1)}
          </div>
          <StarRating rating={averageRating} size="md" />
          <p className="text-amber-100/40 text-xs mt-2">{totalRatings} avaliação{totalRatings !== 1 ? "ões" : ""}</p>
          <div className="mt-4 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star] || 0;
              const pct = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="text-amber-100/50 w-3">{star}</span>
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  <div className="flex-1 h-1.5 rounded-full bg-amber-500/10 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-amber-100/30 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1">
          {session?.user ? (
            <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-amber-500/20 bg-[#1a0f07] space-y-4">
              <h4 className="text-amber-100 font-medium">Deixe sua avaliação</h4>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-0.5 transition-colors"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6",
                        star <= newRating
                          ? "text-amber-400 fill-amber-400"
                          : "text-amber-500/20 hover:text-amber-400/50"
                      )}
                    />
                  </button>
                ))}
              </div>
              <Input
                placeholder="Título (opcional)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30"
              />
              <Textarea
                placeholder="Escreva seu comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 resize-none"
              />
              <Button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold gap-2"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? "Enviando..." : "Enviar Avaliação"}
              </Button>
            </form>
          ) : (
            <div className="p-5 rounded-xl border border-amber-500/20 bg-[#1a0f07] text-center">
              <p className="text-amber-100/50 text-sm">
                Faça login para deixar sua avaliação.
              </p>
            </div>
          )}

          {reviews.length > 0 && (
            <div className="mt-6 space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 rounded-lg border border-amber-500/10 bg-[#1a0f07]/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-amber-100 text-sm font-medium">{review.userName}</p>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                    </div>
                    <span className="text-amber-100/30 text-xs shrink-0">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  {review.title && (
                    <p className="text-amber-100 font-medium text-sm mt-3">{review.title}</p>
                  )}
                  <p className="text-amber-100/60 text-sm mt-1.5 leading-relaxed">{review.comment}</p>
                </div>
              ))}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={cn(
                        "w-8 h-8 rounded text-xs transition-colors",
                        page === i + 1
                          ? "bg-amber-500 text-[#1a0f07] font-medium"
                          : "text-amber-100/50 hover:text-amber-300 hover:bg-amber-500/10"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && reviews.length === 0 && (
            <p className="text-amber-100/40 text-center py-8 text-sm">
              Nenhuma avaliação ainda. Seja o primeiro a avaliar!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
