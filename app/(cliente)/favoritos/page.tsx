"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2, Package } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCartStore, type CartProduct } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface WishlistProduct {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    volumeMl: number | null;
    alcoholPercentage: number | null;
    images: { imageUrl: string }[];
    category: { name: string } | null;
  };
}

export default function FavoritosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/favoritos");
      return;
    }
    if (status === "loading") return;

    async function fetchWishlist() {
      try {
        const res = await fetch("/api/wishlist");
        if (res.ok) {
          const data = await res.json();
          setWishlist(data.wishlist || []);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchWishlist();
  }, [status, router]);

  const handleRemove = async (productId: string) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        setWishlist((prev) => prev.filter((w) => w.productId !== productId));
        toast.success("Removido dos favoritos");
      }
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const handleAddToCart = (p: WishlistProduct["product"]) => {
    const cartProduct: CartProduct = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      imageUrl: p.images?.[0]?.imageUrl || null,
      volumeMl: p.volumeMl || null,
      stock: p.stock,
    };
    addItem(cartProduct);
    toast.success(`${p.name} adicionado ao carrinho`);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center" style={{ backgroundColor: "#120a04" }}>
        <div className="animate-pulse space-y-4 w-full max-w-2xl">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-amber-500/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center" style={{ backgroundColor: "#120a04" }}>
        <Heart className="h-16 w-16 text-amber-500/10 mb-4" />
        <h1 className="font-display text-2xl text-amber-100 mb-2">Faça login</h1>
        <p className="text-amber-100/40 mb-6">Entre para ver seus favoritos.</p>
        <Link href="/login?callbackUrl=/favoritos">
          <Button className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold">Entrar</Button>
        </Link>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center" style={{ backgroundColor: "#120a04" }}>
        <Heart className="h-16 w-16 text-amber-500/10 mb-4" />
        <h1 className="font-display text-2xl text-amber-100 mb-2">Seus Favoritos</h1>
        <p className="text-amber-100/40 mb-6">Você ainda não favoritou nenhum produto.</p>
        <Link href="/produtos">
          <Button className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold">
            <Package className="mr-2 h-4 w-4" />
            Ver Produtos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#120a04" }}>
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-amber-100">Favoritos</h1>
            <p className="text-amber-100/40 text-sm mt-1">{wishlist.length} produto{wishlist.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="space-y-3">
          {wishlist.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 rounded-xl border border-amber-500/20 bg-[#1a0f07]"
            >
              <Link href={`/produtos/${item.product.slug}`} className="shrink-0">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-amber-500/5 border border-amber-500/10">
                  {item.product.images?.[0]?.imageUrl ? (
                    <Image
                      src={item.product.images[0].imageUrl}
                      alt={item.product.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-8 w-8 text-amber-500/20" />
                    </div>
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/produtos/${item.product.slug}`} className="text-amber-100 font-medium hover:text-amber-300 transition-colors line-clamp-1">
                  {item.product.name}
                </Link>
                <p className="text-amber-100/40 text-xs mt-0.5">
                  {item.product.volumeMl ? `${item.product.volumeMl}ml` : ""}
                  {item.product.volumeMl && item.product.alcoholPercentage ? " · " : ""}
                  {item.product.alcoholPercentage ? `${item.product.alcoholPercentage}%` : ""}
                  {item.product.category ? ` · ${item.product.category.name}` : ""}
                </p>
                <p className="text-amber-400 font-bold mt-1">{formatCurrency(item.product.price)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(item.product)}
                  disabled={item.product.stock === 0}
                  className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07]"
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemove(item.productId)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
