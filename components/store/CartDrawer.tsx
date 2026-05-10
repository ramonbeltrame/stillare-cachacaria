"use client";

import { useState, useCallback, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface CartDrawerProps {
  open?: boolean;
  onClose?: () => void;
  children?: ReactNode;
}

export function CartDrawer({ open: controlledOpen, onClose: controlledOnClose, children }: CartDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleClose = useCallback(() => {
    if (isControlled) {
      controlledOnClose?.();
    } else {
      setInternalOpen(false);
    }
  }, [isControlled, controlledOnClose]);

  const handleOpen = useCallback(() => {
    if (!isControlled) {
      setInternalOpen(true);
    }
  }, [isControlled]);

  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCartStore();
  const router = useRouter();
  const { data: session } = useSession();

  const handleCheckout = useCallback(() => {
    if (!session) {
      toast.error("Faça login para continuar. Venda proibida para menores de 18 anos.");
      handleClose();
      router.push("/login?callbackUrl=/checkout");
      return;
    }
    handleClose();
    router.push("/checkout");
  }, [handleClose, router, session]);

  const total = subtotal();
  const itemCount = totalItems();

  return (
    <>
      {children && !isControlled && (
        <div onClick={handleOpen} className="cursor-pointer">
          {children}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
              onClick={handleClose}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 right-0 z-[90] h-full w-full max-w-md flex flex-col shadow-2xl bg-card"
            >
              <div className="flex items-center justify-between p-5 border-b border-amber-500/20">
                <h2 className="font-display text-lg text-amber-100 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Seu Carrinho ({itemCount} {itemCount === 1 ? "item" : "itens"})
                </h2>
                <button
                  onClick={handleClose}
                  className="text-amber-100/50 hover:text-amber-300 transition-colors"
                  aria-label="Fechar carrinho"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <ShoppingBag className="h-16 w-16 text-amber-500/20 mb-6" />
                  <p className="text-amber-100/60 text-lg mb-2">
                    Seu carrinho está vazio
                  </p>
                  <Link
                    href="/produtos"
                    onClick={handleClose}
                    className="mt-4 inline-flex items-center justify-center h-10 px-6 rounded-md border border-amber-500/30 text-amber-100 hover:bg-amber-500/5 transition-colors text-sm"
                  >
                    Ver Produtos
                  </Link>
                </div>
              ) : !session ? (
                /* BLOQUEIO: usuário não logado não vê os itens */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <LogIn className="h-16 w-16 text-amber-500/30 mb-6" />
                  <p className="text-amber-100 font-display text-lg mb-2">
                    Faça login para continuar
                  </p>
                  <p className="text-amber-100/50 text-sm max-w-xs mb-6">
                    Por lei, a venda de bebidas alcoólicas é proibida para menores de 18 anos. Precisamos confirmar sua idade.
                  </p>
                  <Button
                    onClick={handleCheckout}
                    className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold h-12 px-8"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar na conta
                  </Button>
                  <Link
                    href="/cadastro"
                    onClick={handleClose}
                    className="mt-3 text-sm text-amber-400 hover:text-amber-300"
                  >
                    Criar conta
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex gap-3 pb-4 border-b border-amber-500/10 last:border-0 last:pb-0"
                      >
                        <div className="relative w-12 h-12 rounded-md bg-amber-500/5 overflow-hidden shrink-0">
                          {item.product.imageUrl ? (
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              fill
                              sizes="48px"
                              className="object-contain p-1"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ShoppingBag className="h-5 w-5 text-amber-500/20" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm text-amber-100 font-medium truncate">
                            {item.product.name}
                          </h4>
                          {item.product.volumeMl && (
                            <p className="text-[11px] text-amber-100/40 mt-0.5">
                              {item.product.volumeMl}ml
                            </p>
                          )}
                          <p className="text-sm font-semibold text-amber-400 mt-1">
                            {formatCurrency(item.unitPrice)}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-amber-500/30 rounded-md">
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.quantity - 1)
                                }
                                className="p-1.5 text-amber-100/70 hover:text-amber-300 transition-colors"
                                aria-label="Diminuir quantidade"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm text-amber-100">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.quantity + 1)
                                }
                                className="p-1.5 text-amber-100/70 hover:text-amber-300 transition-colors"
                                aria-label="Aumentar quantidade"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-amber-100">
                                {formatCurrency(item.unitPrice * item.quantity)}
                              </span>
                              <button
                                onClick={() => removeItem(item.productId)}
                                className="text-amber-100/30 hover:text-red-400 transition-colors"
                                aria-label="Remover item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-amber-500/20 p-5 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-amber-100/60">Subtotal</span>
                      <span className="text-amber-100 font-semibold">
                        {formatCurrency(total)}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-100/30 text-center">
                      Frete calculado no checkout
                    </p>
                    <div className="flex items-center justify-between border-t border-amber-500/10 pt-3">
                      <span className="text-base font-display text-amber-100">Total</span>
                      <span className="text-xl font-display font-semibold text-amber-400">
                        {formatCurrency(total)}
                      </span>
                    </div>
                    <Button
                      onClick={handleCheckout}
                      className="w-full h-12 text-base bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold"
                    >
                      {session ? "Finalizar Compra" : (
                        <span className="flex items-center gap-2">
                          <LogIn className="h-4 w-4" />
                          Fazer login para comprar
                        </span>
                      )}
                    </Button>
                    {!session && (
                      <p className="text-[11px] text-amber-100/40 text-center -mt-2">
                        Login obrigatório — venda proibida para menores de 18 anos
                      </p>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
