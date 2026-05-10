"use client";

import { AlertTriangle, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StockProduct {
  name: string;
  stock: number;
  reorderLevel: number;
}

interface StockAlertProps {
  products: StockProduct[];
}

export function StockAlert({ products }: StockAlertProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-10 w-10 text-amber-500/20 mb-3" />
        <p className="text-amber-100/40 text-sm font-light">
          Nenhum alerta de estoque
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {products.map((product, index) => {
        const isOutOfStock = product.stock === 0;
        const isLow = product.stock > 0 && product.stock <= product.reorderLevel;

        return (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-4 rounded-lg border transition-colors",
              isOutOfStock
                ? "bg-red-500/5 border-red-500/20"
                : "bg-yellow-500/5 border-yellow-500/20"
            )}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle
                className={cn(
                  "h-5 w-5 shrink-0",
                  isOutOfStock ? "text-red-400" : "text-yellow-400"
                )}
              />
              <div className="flex flex-col">
                <span className="text-sm text-amber-100 font-medium">
                  {product.name}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    isOutOfStock
                      ? "text-red-400/70"
                      : "text-yellow-400/70"
                  )}
                >
                  Estoque mínimo: {product.reorderLevel} unidades
                </span>
              </div>
            </div>
            <Badge
              className={cn(
                "border-0 text-[10px] font-semibold uppercase tracking-wider shrink-0",
                isOutOfStock
                  ? "bg-red-500/90 text-white"
                  : "bg-yellow-500/90 text-white"
              )}
            >
              {isOutOfStock
                ? "Esgotado"
                : `${product.stock} em estoque`}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
