"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Package,
  Clock,
  UserPlus,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  ChevronRight,
} from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { OrderTable } from "@/components/admin/OrderTable";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { StockAlert } from "@/components/admin/StockAlert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatCurrency,
  formatDate,
  getOrderStatusLabel,
  getOrderStatusColor,
  getPaymentStatusLabel,
  getPaymentStatusColor,
} from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface DashboardData {
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  newCustomers: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    billingName: string;
    billingEmail: string;
    total: number;
    status: string;
    paymentStatus: string;
    nfeStatus: string | null;
    createdAt: string;
  }[];
  revenueByDay: { date: string; revenue: number }[];
  topProducts: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    totalSold: number;
  }[];
  lowStockProducts: {
    id: string;
    name: string;
    slug: string;
    stock: number;
    reorderLevel: number;
    category: { name: string };
  }[];
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-amber-500/5 ${className || ""}`}
    />
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar");
        return res.json();
      })
      .then(setData)
      .catch(() => {
        toast.error("Erro ao carregar dashboard");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-amber-100 mb-2">
          Erro ao carregar
        </h2>
        <p className="text-amber-100/40 mb-6">
          Não foi possível carregar os dados do dashboard.
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  const revenueChartData = data.revenueByDay.map((item) => ({
    name: new Date(item.date + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
    value: item.revenue,
    date: item.date,
  }));

  const recentOrdersFormatted = data.recentOrders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.billingName || "—",
    customerEmail: order.billingEmail || "—",
    total: Number(order.total || 0),
    status: order.status,
    paymentStatus: order.paymentStatus,
    nfeStatus: order.nfeStatus,
    createdAt: order.createdAt,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-amber-100">
            Dashboard
          </h1>
          <p className="text-amber-100/40 text-sm mt-1">
            Visão geral do seu negócio
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Receita Hoje"
          value={formatCurrency(data.todayRevenue || 0)}
          description="Total de vendas aprovadas hoje"
          icon={DollarSign}
        />
        <DashboardCard
          title="Pedidos Hoje"
          value={data.todayOrders || 0}
          description="Pedidos realizados hoje"
          icon={ShoppingCart}
        />
        <DashboardCard
          title="Pedidos Pendentes"
          value={data.pendingOrders || 0}
          description="Aguardando processamento"
          icon={Clock}
        />
        <DashboardCard
          title="Clientes Novos"
          value={data.newCustomers || 0}
          description="Cadastrados hoje"
          icon={UserPlus}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#120a04] border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-amber-100 text-lg">
              Receita (30 dias)
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-amber-400" />
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueChartData} />
          </CardContent>
        </Card>

        <Card className="bg-[#120a04] border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-amber-100 text-lg">
              Alertas de Estoque
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <StockAlert
              products={data.lowStockProducts.map((p) => ({
                name: p.name,
                stock: p.stock,
                reorderLevel: p.reorderLevel,
              }))}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#120a04] border-amber-500/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-amber-100 text-lg">
            Pedidos Recentes
          </CardTitle>
          <Link href="/admin/pedidos">
            <Button
              variant="ghost"
              size="sm"
              className="text-amber-400 hover:text-amber-300 gap-1"
            >
              Ver todos
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <OrderTable
            orders={recentOrdersFormatted}
            onViewOrder={(orderId) =>
              router.push(`/admin/pedidos/${orderId}`)
            }
          />
        </CardContent>
      </Card>

      {data.topProducts.length > 0 && (
        <Card className="bg-[#120a04] border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-amber-100 text-lg">
              Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-amber-500/20">
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                      Produto
                    </th>
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                      Preço
                    </th>
                    <th className="text-right py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                      Qtde Vendida
                    </th>
                    <th className="text-right py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                      Estoque
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-amber-500/10 hover:bg-amber-500/5"
                    >
                      <td className="py-3 px-4">
                        <span className="text-amber-100 font-medium">
                          {product.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-amber-100/60">
                        {formatCurrency(Number(product.price) || 0)}
                      </td>
                      <td className="py-3 px-4 text-right text-amber-100 font-semibold">
                        {product.totalSold || 0}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={
                            product.stock <= 0
                              ? "text-red-400"
                              : "text-amber-100/60"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
