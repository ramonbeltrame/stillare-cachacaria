"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getOrderStatusLabel,
  getOrderStatusColor,
  maskCpf,
  maskPhone,
} from "@/lib/utils";
import toast from "react-hot-toast";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  BANNED: "Banido",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400",
  INACTIVE: "bg-gray-500/10 text-gray-400",
  BANNED: "bg-red-500/10 text-red-400",
};

export default function AdminCustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const customerId = params.id;
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/customers/${customerId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Cliente não encontrado");
        return res.json();
      })
      .then((data) => {
        setCustomer(data.customer);
        setOrders(data.orders || []);
      })
      .catch(() => {
        toast.error("Erro ao carregar cliente");
        router.push("/admin/clientes");
      })
      .finally(() => setLoading(false));
  }, [customerId, router]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-amber-500/5 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-amber-500/5 rounded-xl" />
          <div className="lg:col-span-2 h-96 bg-amber-500/5 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-amber-100 mb-2">
          Cliente não encontrado
        </h2>
        <Button
          onClick={() => router.push("/admin/clientes")}
          variant="outline"
          className="mt-4 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
        >
          Voltar para clientes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-amber-100/60 hover:text-amber-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-amber-100">
              {customer.fullName}
            </h1>
            <Badge
              className={`${STATUS_COLORS[customer.status] || "bg-gray-500/10 text-gray-400"} border-0 text-[11px]`}
            >
              {STATUS_LABELS[customer.status] || customer.status}
            </Badge>
          </div>
          <p className="text-amber-100/40 text-sm mt-1">
            Cliente desde {formatDate(customer.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#120a04] border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-amber-400" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs text-amber-100/40 flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email
              </span>
              <p className="text-amber-100 text-sm mt-0.5">{customer.email}</p>
            </div>
            {customer.phone && (
              <div>
                <span className="text-xs text-amber-100/40 flex items-center gap-1.5">
                  <Phone className="h-3 w-3" /> Telefone
                </span>
                <p className="text-amber-100 text-sm mt-0.5 font-mono">
                  {maskPhone(customer.phone)}
                </p>
              </div>
            )}
            {customer.cpf && (
              <div>
                <span className="text-xs text-amber-100/40 flex items-center gap-1.5">
                  <CreditCard className="h-3 w-3" /> CPF
                </span>
                <p className="text-amber-100 text-sm mt-0.5 font-mono">
                  {maskCpf(customer.cpf)}
                </p>
              </div>
            )}
            {customer.dateOfBirth && (
              <div>
                <span className="text-xs text-amber-100/40 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> Data de Nascimento
                </span>
                <p className="text-amber-100 text-sm mt-0.5">
                  {formatDate(customer.dateOfBirth)}
                </p>
              </div>
            )}
            <Separator className="bg-amber-500/10" />
            <div>
              <span className="text-xs text-amber-100/40">
                Email verificado
              </span>
              <p className="text-amber-100 text-sm mt-0.5">
                {customer.verifiedEmail ? "Sim" : "Não"}
              </p>
            </div>
            {customer.lastLogin && (
              <div>
                <span className="text-xs text-amber-100/40">
                  Último login
                </span>
                <p className="text-amber-100 text-sm mt-0.5">
                  {formatDateTime(customer.lastLogin)}
                </p>
              </div>
            )}
            <div className="pt-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-amber-100/40">Total de Pedidos</span>
                <span className="text-lg font-bold text-amber-400">
                  {customer.totalOrders || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-amber-100/40">Total Gasto</span>
                <span className="text-lg font-bold text-amber-400">
                  {formatCurrency(customer.totalSpent || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card className="bg-[#120a04] border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-amber-400" />
                Histórico de Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingCart className="h-10 w-10 text-amber-500/20 mb-3" />
                  <p className="text-amber-100/40 text-sm">
                    Nenhum pedido encontrado para este cliente.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-amber-500/20">
                        <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                          Nº Pedido
                        </th>
                        <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                          Total
                        </th>
                        <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                          Data
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order: any) => (
                        <tr
                          key={order.id}
                          className="border-b border-amber-500/10 hover:bg-amber-500/5 cursor-pointer transition-colors"
                          onClick={() =>
                            router.push(`/admin/pedidos/${order.id}`)
                          }
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono text-amber-300 text-xs">
                              {order.orderNumber}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-amber-100 font-semibold">
                            {formatCurrency(Number(order.totalAmount))}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={`${getOrderStatusColor(order.status)} border-0 text-[10px] font-medium`}
                            >
                              {getOrderStatusLabel(order.status)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-amber-100/60 text-xs">
                            {formatDate(order.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
