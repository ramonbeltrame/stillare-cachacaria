"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();
  const router = useRouter();

  const total = subtotal();
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <div
        className="min-h-[70vh] flex flex-col items-center justify-center"
        style={{ backgroundColor: "#120a04" }}
      >
        <ShoppingBag className="h-20 w-20 text-amber-500/10 mb-6" />
        <h1 className="font-display text-3xl text-amber-100 mb-3">
          Seu carrinho está vazio
        </h1>
        <p className="text-amber-100/40 mb-8 font-light">
          Adicione produtos para começar sua experiência.
        </p>
        <Link href="/produtos">
          <Button className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold h-12 px-8">
            Ver Produtos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#120a04" }}>
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-amber-100 mb-1">
              Seu Carrinho
            </h1>
            <p className="text-amber-100/40 font-light">
              {items.length} {items.length === 1 ? "item" : "itens"}
            </p>
          </div>
          <Link
            href="/produtos"
            className="hidden sm:flex items-center gap-2 text-amber-100/50 hover:text-amber-300 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Continuar Comprando
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 p-4 rounded-lg border border-amber-500/20 bg-[#1a0f07]"
              >
                <div className="relative w-24 h-24 rounded-md bg-amber-500/5 overflow-hidden shrink-0">
                  {item.product.imageUrl ? (
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-amber-500/20">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link
                      href={`/produto/${item.product.slug}`}
                      className="font-display text-base text-amber-100 hover:text-amber-300 transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    {item.product.volumeMl && (
                      <p className="text-xs text-amber-100/40 mt-0.5">
                        {item.product.volumeMl}ml
                      </p>
                    )}
                    <p className="text-sm font-semibold text-amber-400 mt-1">
                      {formatCurrency(item.unitPrice)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-amber-500/30 rounded-md">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="p-2 text-amber-100/70 hover:text-amber-300 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm text-amber-100 font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="p-2 text-amber-100/70 hover:text-amber-300 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-base font-semibold text-amber-100">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-amber-100/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div
              className="p-6 rounded-lg border border-amber-500/20 sticky top-24"
              style={{ backgroundColor: "#1a0f07" }}
            >
              <h2 className="font-display text-lg text-amber-100 mb-6">
                Resumo do Pedido
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-100/60">Subtotal</span>
                  <span className="text-amber-100">{formatCurrency(total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-100/60">Frete</span>
                  <span className="text-amber-100/40">Calculado no checkout</span>
                </div>

                <div className="border-t border-amber-500/10 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-base text-amber-100">
                      Total
                    </span>
                    <span className="font-display text-2xl text-amber-400 font-semibold">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                {total >= 200 && (
                  <div className="flex items-center gap-2 text-xs text-green-400 mt-2">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    Frete grátis disponível
                  </div>
                )}
              </div>

              <Button
                onClick={() => router.push("/checkout")}
                className="w-full h-12 mt-6 text-base bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold"
              >
                Finalizar Compra
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Link
                href="/produtos"
                className="flex items-center justify-center gap-2 mt-4 text-sm text-amber-100/40 hover:text-amber-300 transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
