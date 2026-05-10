"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ChevronRight, Clock, CheckCircle, XCircle, Truck, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor, getPaymentStatusLabel, getPaymentStatusColor } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: Array<{ id: string; productName: string; quantity: number }>;
}

export default function MeusPedidosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/meus-pedidos");
      return;
    }
    if (status === "loading") return;

    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.orders || [];
          setOrders(list);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center" style={{ backgroundColor: "#120a04" }}>
        <div className="animate-pulse space-y-4 w-full max-w-2xl px-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-amber-500/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#120a04" }}>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="font-display text-3xl text-amber-100 mb-2">Meus Pedidos</h1>
        <p className="text-amber-100/40 font-light mb-10">Acompanhe o status dos seus pedidos</p>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-amber-500/10 mx-auto mb-4" />
            <p className="text-amber-100/50 text-lg mb-2">Nenhum pedido encontrado</p>
            <p className="text-amber-100/30 text-sm mb-6">Seus pedidos aparecerão aqui após a primeira compra.</p>
            <Link href="/produtos" className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">
              Ir para a loja
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/meus-pedidos/${order.id}`}
                className="block p-5 rounded-lg border border-amber-500/20 bg-[#1a0f07] hover:border-amber-500/40 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-amber-300 font-display text-sm tracking-wide mb-1">
                      #{order.orderNumber}
                    </p>
                    <p className="text-amber-100/40 text-xs mb-2">{formatDate(order.createdAt)}</p>
                    <p className="text-amber-100/60 text-sm truncate">
                      {order.items.map((item) => item.productName).join(", ")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex gap-1.5">
                      <Badge className={getOrderStatusColor(order.status)}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {getPaymentStatusLabel(order.paymentStatus)}
                      </Badge>
                    </div>
                    <span className="text-amber-400 font-semibold text-base">
                      {formatCurrency(Number(order.totalAmount))}
                    </span>
                    <ChevronRight className="h-4 w-4 text-amber-100/20 group-hover:text-amber-400 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 p-4 rounded-lg border border-amber-500/10 bg-[#1a0f07] text-sm text-amber-100/40 space-y-1">
          <p><span className="text-amber-400">●</span> Pendente: aguardando pagamento</p>
          <p><span className="text-green-400">●</span> Aprovado: pagamento confirmado</p>
          <p><span className="text-purple-400">●</span> Enviado: pedido a caminho</p>
          <p><span className="text-green-300">●</span> Entregue: pedido recebido</p>
        </div>
      </div>
    </div>
  );
}
