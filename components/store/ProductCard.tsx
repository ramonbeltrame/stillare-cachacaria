"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Wine } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore, type CartProduct } from "@/store/cartStore";
import { formatCurrency, cn } from "@/lib/utils";
import { WishlistButton } from "@/components/store/WishlistButton";
import toast from "react-hot-toast";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  volumeMl: number | null;
  alcoholPercentage: number | null;
  stock: number;
  isFeatured?: boolean;
  product?: any; // Accept product object as single prop for compatibility
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  imageUrl,
  volumeMl,
  alcoholPercentage,
  stock,
  isFeatured = false,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const isSoldOut = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;

    const cartProduct: CartProduct = {
      id,
      name,
      slug,
      price,
      imageUrl: imageUrl || null,
      volumeMl: volumeMl || null,
      stock,
    };
    addItem(cartProduct);
    toast.success(`${name} adicionado ao carrinho`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group relative flex flex-col rounded-xl border border-amber-500/20 bg-[#1a0f07] overflow-hidden",
        "transition-shadow duration-300 hover:shadow-lg hover:shadow-amber-500/5 hover:border-amber-500/40",
        isSoldOut && "opacity-70"
      )}
    >
      <Link href={`/produtos/${slug}`} className="block">
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {isFeatured && (
            <Badge className="bg-amber-500 hover:bg-amber-500 text-[#1a0f07] text-[10px] font-semibold uppercase tracking-wider border-0">
              Destaque
            </Badge>
          )}
          {isLowStock && (
            <Badge className="bg-yellow-500/90 hover:bg-yellow-500/90 text-white text-[10px] font-semibold uppercase tracking-wider border-0">
              Pouco Estoque
            </Badge>
          )}
          {isSoldOut && (
            <Badge className="bg-red-500/90 hover:bg-red-500/90 text-white text-[10px] font-semibold uppercase tracking-wider border-0">
              Esgotado
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3 z-10">
          <WishlistButton productId={id} className="w-8 h-8 rounded-full bg-[#1a0f07]/80 backdrop-blur-sm" />
        </div>

        <div className="relative aspect-square bg-muted overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-6 transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Wine className="h-20 w-20 text-amber-500/20" />
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col gap-2">
          <h3 className="font-display text-lg text-amber-100 line-clamp-2 leading-tight">
            {name}
          </h3>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {volumeMl && <span>{volumeMl}ml</span>}
            {volumeMl && alcoholPercentage && (
              <span className="w-1 h-1 rounded-full bg-amber-500/40" />
            )}
            {alcoholPercentage && <span>{alcoholPercentage}% vol.</span>}
          </div>

          <div className="mt-1 text-2xl font-bold font-display text-primary">
            {formatCurrency(price)}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4 mt-auto">
        <Button
          onClick={handleAddToCart}
          disabled={isSoldOut}
          variant={isSoldOut ? "secondary" : "default"}
          className={cn(
            "w-full gap-2 h-10 text-sm",
            !isSoldOut &&
              "bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold"
          )}
        >
          <ShoppingCart className="h-4 w-4" />
          {isSoldOut ? "Esgotado" : "Adicionar"}
        </Button>
      </div>
    </motion.div>
  );
}

// Default export for compatibility: accepts { product } as single prop
export default function ProductCardWrapper({ product }: { product: any }) {
  const img = product.images?.find((i: any) => i.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl || null;
  return (
    <ProductCard
      id={product.id}
      name={product.name}
      slug={product.slug}
      price={product.price}
      imageUrl={img}
      volumeMl={product.volumeMl ?? null}
      alcoholPercentage={product.alcoholPercentage ?? null}
      stock={product.stock}
      isFeatured={product.isFeatured}
    />
  );
}
