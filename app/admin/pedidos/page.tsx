"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatCurrency,
  formatDate,
  getOrderStatusLabel,
  getOrderStatusColor,
  getPaymentStatusLabel,
  getPaymentStatusColor,
} from "@/lib/utils";
import toast from "react-hot-toast";

interface Order {
  id: string;
  orderNumber: string;
  billingName: string;
  billingEmail: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  invoice: { nfeNumber: string | null; status: string | null } | null;
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  pages: number;
}

const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao carregar pedidos");
      const data: OrdersResponse = await res.json();
      setOrders(data.orders);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch {
      toast.error("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchOrders();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-amber-100">
            Pedidos
          </h1>
          <p className="text-amber-100/40 text-sm mt-1">
            {total} pedido{total !== 1 ? "s" : ""} encontrado
            {total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-100/30" />
          <Input
            placeholder="Buscar por nº pedido, nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#120a04] border-amber-500/20 text-amber-100 placeholder:text-amber-100/30"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-full sm:w-48 bg-[#120a04] border-amber-500/20 text-amber-100">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {getOrderStatusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-14 bg-amber-500/5 rounded-lg"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingCart className="h-12 w-12 text-amber-500/20 mb-4" />
          <h2 className="text-xl font-semibold text-amber-100 mb-2">
            Nenhum pedido encontrado
          </h2>
          <p className="text-amber-100/40 text-sm">
            {search || statusFilter !== "all"
              ? "Tente ajustar os filtros."
              : "Os pedidos realizados aparecerão aqui."}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-[#120a04] border border-amber-500/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-amber-500/20 bg-[#0c0602]">
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
                      Nº Pedido
                    </th>
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
                      Total
                    </th>
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
                      Pagamento
                    </th>
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
                      Data
                    </th>
                    <th className="text-right py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-amber-500/10 hover:bg-amber-500/5 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/pedidos/${order.id}`)}
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-amber-300 text-xs">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-amber-100 font-medium">
                            {order.billingName || "—"}
                          </span>
                          <span className="text-amber-100/40 text-[11px]">
                            {order.billingEmail || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-amber-100 font-semibold">
                        {formatCurrency(Number(order.totalAmount) || 0)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`${getOrderStatusColor(order.status)} border-0 text-[10px] font-medium`}
                        >
                          {getOrderStatusLabel(order.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {order.paymentStatus ? (
                          <Badge
                            className={`${getPaymentStatusColor(order.paymentStatus)} border-0 text-[10px] font-medium`}
                          >
                            {getPaymentStatusLabel(order.paymentStatus)}
                          </Badge>
                        ) : (
                          <span className="text-amber-100/20 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-amber-100/60 text-xs">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/pedidos/${order.id}`);
                          }}
                          className="h-8 w-8 text-amber-100/50 hover:text-amber-300"
                          aria-label={`Ver pedido ${order.orderNumber}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-amber-500/20 text-amber-100/60 hover:text-amber-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-amber-100/60 px-4">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-amber-500/20 text-amber-100/60 hover:text-amber-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
