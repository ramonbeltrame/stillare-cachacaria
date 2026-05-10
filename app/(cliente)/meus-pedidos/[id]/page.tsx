"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Package, Truck, Clock, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusColor, getPaymentStatusLabel } from "@/lib/utils";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { status } = useSession();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "loading") return;
    fetchOrder();
  }, [id, status]);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order || data);
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  const handlePay = async () => {
    const res = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.init_point) window.location.href = data.init_point;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#120a04" }}>
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-8 w-64 bg-amber-500/5 rounded mx-auto" />
          <div className="h-4 w-48 bg-amber-500/5 rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "#120a04" }}>
        <Package className="h-16 w-16 text-amber-500/20 mb-4" />
        <h1 className="font-display text-2xl text-amber-100 mb-2">Pedido não encontrado</h1>
        <Link href="/meus-pedidos">
          <Button variant="outline" className="mt-4 border-amber-500/30 text-amber-100">Ver meus pedidos</Button>
        </Link>
      </div>
    );
  }

  const statusIcon = {
    PENDING: <Clock className="h-5 w-5" />,
    PAID: <CheckCircle className="h-5 w-5" />,
    PROCESSING: <Clock className="h-5 w-5" />,
    SHIPPED: <Truck className="h-5 w-5" />,
    DELIVERED: <CheckCircle className="h-5 w-5" />,
    CANCELLED: <XCircle className="h-5 w-5" />,
  };

  return (
    <div style={{ backgroundColor: "#120a04" }} className="min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <Link href="/meus-pedidos" className="inline-flex items-center gap-2 text-amber-100/50 hover:text-amber-300 mb-8 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Voltar para meus pedidos
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl text-amber-100">Pedido {order.orderNumber}</h1>
            <p className="text-amber-100/40 text-sm mt-1">{formatDateTime(order.createdAt)}</p>
          </div>
          <Badge className={getOrderStatusColor(order.status)}>
            {getOrderStatusLabel(order.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg border border-amber-500/20 bg-[#1a0f07]">
            <p className="text-amber-100/40 text-xs mb-1">Pagamento</p>
            <p className="text-amber-100 font-medium">{getPaymentStatusLabel(order.paymentStatus)}</p>
          </div>
          <div className="p-4 rounded-lg border border-amber-500/20 bg-[#1a0f07]">
            <p className="text-amber-100/40 text-xs mb-1">Método de Envio</p>
            <p className="text-amber-100 font-medium">{order.shippingMethod || "—"}</p>
          </div>
          <div className="p-4 rounded-lg border border-amber-500/20 bg-[#1a0f07]">
            <p className="text-amber-100/40 text-xs mb-1">Rastreamento</p>
            <p className="text-amber-100 font-medium">{order.trackingCode || "Pendente"}</p>
          </div>
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-[#1a0f07] overflow-hidden mb-8">
          <div className="p-4 border-b border-amber-500/10">
            <h2 className="font-display text-lg text-amber-100">Itens do Pedido</h2>
          </div>
          <div className="divide-y divide-amber-500/10">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                {item.product?.images?.[0]?.imageUrl && (
                  <Image src={item.product.images[0].imageUrl} alt={item.productName} width={48} height={48} className="rounded object-cover bg-amber-500/5" />
                )}
                <div className="flex-1">
                  <p className="text-amber-100">{item.productName}</p>
                  <p className="text-amber-100/40 text-sm">Qtd: {item.quantity}</p>
                </div>
                <p className="text-amber-100 font-medium">{formatCurrency(item.unitPrice * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        {order.shippingAddress && (
          <div className="rounded-lg border border-amber-500/20 bg-[#1a0f07] overflow-hidden mb-8">
            <div className="p-4 border-b border-amber-500/10">
              <h2 className="font-display text-lg text-amber-100">Endereço de Entrega</h2>
            </div>
            <div className="p-4 text-amber-100/70 text-sm space-y-1">
              <p className="text-amber-100 font-medium">{order.shippingAddress.recipientName}</p>
              <p>{order.shippingAddress.street}, {order.shippingAddress.number}{order.shippingAddress.complement ? ` - ${order.shippingAddress.complement}` : ""}</p>
              <p>{order.shippingAddress.neighborhood} — {order.shippingAddress.city}/{order.shippingAddress.state}</p>
              <p>CEP: {order.shippingAddress.zipCode}</p>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-amber-500/20 bg-[#1a0f07] p-4 mb-8">
          <div className="flex justify-between py-2 text-sm">
            <span className="text-amber-100/60">Subtotal</span>
            <span className="text-amber-100">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between py-2 text-sm">
            <span className="text-amber-100/60">Frete</span>
            <span className="text-amber-100">{formatCurrency(order.shippingCost)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between py-2 text-sm">
              <span className="text-green-400">Desconto</span>
              <span className="text-green-400">-{formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <Separator className="bg-amber-500/10 my-2" />
          <div className="flex justify-between py-2">
            <span className="text-amber-100 font-display text-lg">Total</span>
            <span className="text-amber-400 font-display text-xl font-bold">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {order.status === "PENDING" && (
          <div className="text-center">
            <Button
              onClick={handlePay}
              className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold"
            >
              Ir para Pagamento
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
