"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle, Package, ShoppingBag, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate, getPaymentStatusLabel } from "@/lib/utils";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  product?: {
    images?: Array<{ imageUrl: string; isPrimary: boolean }>;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

export default function PedidoSucessoPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order || data);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    if (params.id) fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#120a04" }}
      >
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-8 w-64 bg-amber-500/5 rounded mx-auto" />
          <div className="h-4 w-48 bg-amber-500/5 rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#120a04" }}
      >
        <div className="text-center">
          <Package className="h-16 w-16 text-amber-500/20 mx-auto mb-4" />
          <h1 className="font-display text-2xl text-amber-100 mb-2">
            Pedido não encontrado
          </h1>
          <Link href="/produtos">
            <Button
              variant="outline"
              className="mt-4 border-amber-500/30 text-amber-100"
            >
              Ir para a loja
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#120a04" }} className="min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        {/* Green Checkmark Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="flex justify-center mb-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
          >
            <CheckCircle className="h-24 w-24 text-green-400 drop-shadow-lg" />
          </motion.div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl text-amber-100 mb-2">
            Pedido confirmado!
          </h1>
          <p className="text-amber-200/60 text-lg">
            Seu pagamento foi aprovado
          </p>
          <p className="text-amber-400 font-display text-xl mt-2">
            #{order.orderNumber}
          </p>
          <p className="text-amber-100/40 text-sm mt-1">
            {formatDate(order.createdAt)}
          </p>
        </motion.div>

        {/* Total Paid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-amber-100/50 text-sm mb-1">Total pago</p>
          <p className="text-amber-400 font-display text-4xl font-bold">
            {formatCurrency(order.totalAmount)}
          </p>
        </motion.div>

        {/* Products Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="rounded-xl border border-amber-500/20 bg-[#1a0f07] overflow-hidden mb-6"
        >
          <div className="p-5 border-b border-amber-500/10">
            <h2 className="font-display text-lg text-amber-100 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-amber-400" />
              Resumo do pedido
            </h2>
          </div>
          <div className="divide-y divide-amber-500/10">
            {order.items?.map((item: OrderItem) => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                {item.product?.images?.[0]?.imageUrl ? (
                  <Image
                    src={item.product.images[0].imageUrl}
                    alt={item.productName}
                    width={48}
                    height={48}
                    className="rounded object-cover bg-amber-500/5 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-amber-500/5 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-amber-500/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-amber-100 text-sm truncate">
                    {item.productName}
                  </p>
                  <p className="text-amber-100/40 text-xs">
                    Qtd: {item.quantity}
                  </p>
                </div>
                <p className="text-amber-100 text-sm font-medium shrink-0">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="p-5 bg-amber-500/5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-amber-100/50">Subtotal</span>
              <span className="text-amber-100">
                {formatCurrency(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-amber-100/50">Frete</span>
              <span className="text-amber-100">
                {formatCurrency(order.shippingCost)}
              </span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-400">Desconto</span>
                <span className="text-green-400">
                  -{formatCurrency(order.discountAmount)}
                </span>
              </div>
            )}
            <Separator className="bg-amber-500/10 my-1" />
            <div className="flex justify-between">
              <span className="text-amber-100 font-display text-lg">Total</span>
              <span className="text-amber-400 font-display text-xl font-bold">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Info Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="space-y-3 mb-8"
        >
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <FileText className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-amber-100/80 text-sm">
                Você receberá um email de confirmação com os detalhes do pedido.
              </p>
              <p className="text-amber-100/40 text-xs mt-1">
                A Nota Fiscal será enviada em breve para seu e-mail.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link href={`/meus-pedidos/${order.id}`} className="flex-1">
            <Button className="w-full bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold h-12">
              <Package className="mr-2 h-5 w-5" />
              Acompanhar Pedido
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/produtos" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-amber-500/30 text-amber-100 hover:bg-amber-500/10 h-12"
            >
              Continuar Comprando
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
