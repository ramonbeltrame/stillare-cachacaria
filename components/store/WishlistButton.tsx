"use client";

import { useEffect, useState, useCallback } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useWishlistStore } from "@/store/wishlistStore";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  iconClassName?: string;
  variant?: "icon" | "button";
}

export function WishlistButton({ productId, className, iconClassName, variant = "icon" }: WishlistButtonProps) {
  const { data: session } = useSession();
  const { hasItem, toggleItem, loading, setItems } = useWishlistStore();
  const [toggling, setToggling] = useState(false);

  const isInWishlist = hasItem(productId);

  useEffect(() => {
    if (!session?.user) return;
    async function fetchWishlist() {
      try {
        const res = await fetch("/api/wishlist");
        if (res.ok) {
          const data = await res.json();
          const ids = data.items?.map((w: any) => w.productId) || data.wishlist?.map((w: any) => w.productId) || [];
          setItems(ids);
        }
      } catch {}
    }
    fetchWishlist();
  }, [session?.user]);

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!session?.user) {
        toast.error("Faça login para favoritar");
        return;
      }

      setToggling(true);
      toggleItem(productId);

      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (!res.ok) {
          toggleItem(productId);
          toast.error("Erro ao atualizar favoritos");
        }
      } catch {
        toggleItem(productId);
        toast.error("Erro ao atualizar favoritos");
      } finally {
        setToggling(false);
      }
    },
    [productId, session, toggleItem]
  );

  if (variant === "button") {
    return (
      <button
        onClick={handleToggle}
        disabled={toggling}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-500/30 text-sm transition-colors",
          isInWishlist
            ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
            : "text-amber-100/70 hover:text-amber-300 hover:border-amber-500/50",
          className
        )}
      >
        <Heart className={cn("h-4 w-4", isInWishlist && "fill-current", iconClassName)} />
        {isInWishlist ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={toggling}
      className={cn(
        "flex items-center justify-center rounded-full transition-all",
        isInWishlist
          ? "text-red-400 hover:text-red-300"
          : "text-amber-100/40 hover:text-red-400",
        className
      )}
      aria-label={isInWishlist ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart className={cn("h-5 w-5 transition-all", isInWishlist && "fill-current", iconClassName)} />
    </button>
  );
}
