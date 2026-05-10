"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function PaymentMockPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order || data);
        }
      } catch {} finally {
        setStatus("success");
      }
    }
    if (params.id) fetchOrder();
  }, [params.id]);

  const handleSimulatePayment = async (result: "approved" | "rejected") => {
    try {
      await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: result === "approved" ? "APPROVED" : "FAILED",
          status: result === "approved" ? "PAID" : "PENDING",
        }),
      });

      if (result === "approved") {
        router.push(`/meus-pedidos/${params.id}`);
      } else {
        setStatus("failed");
      }
    } catch {
      router.push(`/meus-pedidos/${params.id}`);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#120a04" }}>
        <div className="text-center">
          <Clock className="h-16 w-16 text-amber-500/30 mx-auto mb-4 animate-spin" />
          <p className="text-amber-100/60">Carregando pagamento...</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#120a04" }}>
        <div className="max-w-md text-center">
          <XCircle className="h-20 w-20 text-red-400 mx-auto mb-6" />
          <h1 className="font-display text-2xl text-amber-100 mb-3">Pagamento recusado</h1>
          <p className="text-amber-100/50 mb-8">Não foi possível processar seu pagamento. Tente novamente.</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => handleSimulatePayment("approved")} className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold">
              Tentar novamente
            </Button>
            <Link href="/produtos">
              <Button variant="outline" className="border-amber-500/30 text-amber-100">Continuar comprando</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#120a04" }}>
      <div className="max-w-md text-center">
        <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-6" />
        <h1 className="font-display text-2xl text-amber-100 mb-3">Simular Pagamento</h1>
        <p className="text-amber-100/50 mb-2">Pedido #{order?.orderNumber || params.id}</p>
        {order && (
          <p className="text-amber-400 font-display text-2xl mb-8">{formatCurrency(order.totalAmount)}</p>
        )}
        <p className="text-amber-100/40 text-sm mb-8">
          Em produção, você seria redirecionado ao Mercado Pago. Aqui você pode simular o resultado.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => handleSimulatePayment("approved")} className="bg-green-600 hover:bg-green-500 text-white font-semibold">
            <CheckCircle className="mr-2 h-4 w-4" />
            Aprovar Pagamento
          </Button>
          <Button onClick={() => handleSimulatePayment("rejected")} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
            <XCircle className="mr-2 h-4 w-4" />
            Recusar
          </Button>
        </div>
      </div>
    </div>
  );
}
