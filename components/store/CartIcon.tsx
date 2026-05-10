"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export function CartIcon() {
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <Link
      href="/carrinho"
      className="relative text-amber-100/70 hover:text-amber-300 transition-colors"
      aria-label="Carrinho"
    >
      <ShoppingBag className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-amber-500 rounded-full">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}
