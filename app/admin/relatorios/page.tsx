"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Download,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

type ReportType = "sales" | "products" | "customers" | "financial";

const tabs: { value: ReportType; label: string; icon: React.ElementType }[] = [
  { value: "sales", label: "Vendas", icon: TrendingUp },
  { value: "products", label: "Produtos", icon: Package },
  { value: "customers", label: "Clientes", icon: Users },
  { value: "financial", label: "Financeiro", icon: DollarSign },
];

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("sales");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("type", reportType);
      params.set("startDate", startDate);
      params.set("endDate", endDate);

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao gerar relatório");
      const result = await res.json();
      setData(result);
    } catch {
      toast.error("Erro ao carregar relatório");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [reportType, startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const exportCSV = () => {
    if (!data) return;

    let csvContent = "";
    let filename = "relatorio.csv";

    if (reportType === "sales" && data.orders) {
      csvContent =
        "Nº Pedido,Cliente,Email,Total,Status,Data\n" +
        data.orders
          .map(
            (o: any) =>
              `"${o.orderNumber}","${o.user?.fullName || ""}","${o.user?.email || ""}",${Number(o.totalAmount)},"${o.status}","${o.createdAt}"`
          )
          .join("\n");
      filename = "relatorio-vendas.csv";
    } else if (reportType === "products" && data.products) {
      csvContent =
        "Produto,SKU,Preço,Qtde Vendida,Receita\n" +
        data.products
          .map(
            (p: any) =>
              `"${p.product?.name || ""}","${p.product?.sku || ""}",${p.product?.price || 0},${p.totalQuantity},${p.totalRevenue}`
          )
          .join("\n");
      filename = "relatorio-produtos.csv";
    } else if (reportType === "customers" && data.customers) {
      csvContent =
        "Nome,Email,Total Pedidos,Total Gasto\n" +
        data.customers
          .map(
            (c: any) =>
              `"${c.fullName}","${c.email}",${c.orderCount},${c.totalSpent}`
          )
          .join("\n");
      filename = "relatorio-clientes.csv";
    } else if (reportType === "financial" && data.orders) {
      csvContent =
        "Nº Pedido,Status Pagamento,Subtotal,Frete,Desconto,Total,Data\n" +
        data.orders
          .map(
            (o: any) =>
              `"${o.orderNumber}","${o.paymentStatus}",${Number(o.subtotal)},${Number(o.shippingCost)},${Number(o.discountAmount)},${Number(o.totalAmount)},"${o.createdAt}"`
          )
          .join("\n");
      filename = "relatorio-financeiro.csv";
    }

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado com sucesso!");
  };

  const renderSalesReport = () => {
    if (!data) return null;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-[#120a04] border-amber-500/20">
            <CardContent className="p-6">
              <span className="text-xs text-amber-100/40">Receita Total</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {formatCurrency(data.totalRevenue || 0)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#120a04] border-amber-500/20">
            <CardContent className="p-6">
              <span className="text-xs text-amber-100/40">Total de Pedidos</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {data.totalOrders || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#120a04] border-amber-500/20">
            <CardContent className="p-6">
              <span className="text-xs text-amber-100/40">Ticket Médio</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {formatCurrency(data.averageTicket || 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {data.orders && data.orders.length > 0 && (
          <div className="bg-[#120a04] border border-amber-500/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-amber-500/20 bg-[#0c0602]">
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                      Pedido
                    </th>
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                      Cliente
                    </th>
                    <th className="text-right py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
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
                  {data.orders.map((order: any) => (
                    <tr
                      key={order.id}
                      className="border-b border-amber-500/10"
                    >
                      <td className="py-3 px-4 font-mono text-amber-300 text-xs">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-amber-100 text-xs">
                        {order.user?.fullName || "—"}
                      </td>
                      <td className="py-3 px-4 text-right text-amber-100 font-semibold text-xs">
                        {formatCurrency(Number(order.totalAmount))}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px]">
                          {order.status}
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
          </div>
        )}
      </div>
    );
  };

  const renderProductsReport = () => {
    if (!data) return null;
    if (!data.products || data.products.length === 0) {
      return (
        <div className="text-center py-16 text-amber-100/40">
          Nenhum produto vendido no período.
        </div>
      );
    }
    return (
      <div className="bg-[#120a04] border border-amber-500/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-amber-500/20 bg-[#0c0602]">
                <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                  Produto
                </th>
                <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                  SKU
                </th>
                <th className="text-right py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                  Preço Un.
                </th>
                <th className="text-right py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                  Qtde Vendida
                </th>
                <th className="text-right py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                  Receita
                </th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((p: any, i: number) => (
                <tr key={i} className="border-b border-amber-500/10">
                  <td className="py-3 px-4 text-amber-100 font-medium text-xs">
                    {p.product?.name || "—"}
                  </td>
                  <td className="py-3 px-4 text-amber-100/40 text-xs font-mono">
                    {p.product?.sku || "—"}
                  </td>
                  <td className="py-3 px-4 text-right text-amber-100/60 text-xs">
                    {formatCurrency(Number(p.product?.price || 0))}
                  </td>
                  <td className="py-3 px-4 text-right text-amber-100 font-semibold text-xs">
                    {p.totalQuantity}
                  </td>
                  <td className="py-3 px-4 text-right text-amber-400 font-semibold text-xs">
                    {formatCurrency(p.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCustomersReport = () => {
    if (!data) return null;
    if (!data.customers || data.customers.length === 0) {
      return (
        <div className="text-center py-16 text-amber-100/40">
          Nenhum cliente com pedidos no período.
        </div>
      );
    }
    return (
      <div className="bg-[#120a04] border border-amber-500/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-amber-500/20 bg-[#0c0602]">
                <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                  Nome
                </th>
                <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                  Email
                </th>
                <th className="text-right py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                  Pedidos
                </th>
                <th className="text-right py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                  Total Gasto
                </th>
              </tr>
            </thead>
            <tbody>
              {data.customers.map((c: any) => (
                <tr key={c.id} className="border-b border-amber-500/10">
                  <td className="py-3 px-4 text-amber-100 font-medium text-xs">
                    {c.fullName}
                  </td>
                  <td className="py-3 px-4 text-amber-100/60 text-xs">
                    {c.email}
                  </td>
                  <td className="py-3 px-4 text-right text-amber-100 font-semibold text-xs">
                    {c.orderCount}
                  </td>
                  <td className="py-3 px-4 text-right text-amber-400 font-semibold text-xs">
                    {formatCurrency(c.totalSpent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderFinancialReport = () => {
    if (!data) return null;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-[#120a04] border-amber-500/20">
            <CardContent className="p-4">
              <span className="text-xs text-amber-100/40">Aprovado</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                {formatCurrency(data.summary?.totalApproved || 0)}
              </p>
              <span className="text-[10px] text-amber-100/30">
                {data.summary?.approvedCount || 0} pedidos
              </span>
            </CardContent>
          </Card>
          <Card className="bg-[#120a04] border-amber-500/20">
            <CardContent className="p-4">
              <span className="text-xs text-amber-100/40">Pendente</span>
              <p className="text-xl font-bold text-yellow-400 mt-1">
                {formatCurrency(data.summary?.totalPending || 0)}
              </p>
              <span className="text-[10px] text-amber-100/30">
                {data.summary?.pendingCount || 0} pedidos
              </span>
            </CardContent>
          </Card>
          <Card className="bg-[#120a04] border-amber-500/20">
            <CardContent className="p-4">
              <span className="text-xs text-amber-100/40">Recusado</span>
              <p className="text-xl font-bold text-red-400 mt-1">
                {formatCurrency(data.summary?.totalFailed || 0)}
              </p>
              <span className="text-[10px] text-amber-100/30">
                {data.summary?.failedCount || 0} pedidos
              </span>
            </CardContent>
          </Card>
          <Card className="bg-[#120a04] border-amber-500/20">
            <CardContent className="p-4">
              <span className="text-xs text-amber-100/40">Total Período</span>
              <p className="text-xl font-bold text-amber-400 mt-1">
                {formatCurrency(
                  (data.summary?.totalApproved || 0) +
                    (data.summary?.totalPending || 0) +
                    (data.summary?.totalFailed || 0)
                )}
              </p>
              <span className="text-[10px] text-amber-100/30">
                {(data.summary?.approvedCount || 0) +
                  (data.summary?.pendingCount || 0) +
                  (data.summary?.failedCount || 0)}{" "}
                total
              </span>
            </CardContent>
          </Card>
        </div>

        {data.orders && data.orders.length > 0 && (
          <div className="bg-[#120a04] border border-amber-500/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-amber-500/20 bg-[#0c0602]">
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                      Pedido
                    </th>
                    <th className="text-right py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                      Subtotal
                    </th>
                    <th className="text-right py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                      Frete
                    </th>
                    <th className="text-right py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                      Desconto
                    </th>
                    <th className="text-right py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
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
                  {data.orders.map((order: any) => (
                    <tr
                      key={order.id}
                      className="border-b border-amber-500/10"
                    >
                      <td className="py-3 px-4 font-mono text-amber-300 text-xs">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-right text-amber-100/60 text-xs">
                        {formatCurrency(Number(order.subtotal))}
                      </td>
                      <td className="py-3 px-4 text-right text-amber-100/60 text-xs">
                        {formatCurrency(Number(order.shippingCost))}
                      </td>
                      <td className="py-3 px-4 text-right text-amber-100/60 text-xs">
                        {formatCurrency(Number(order.discountAmount))}
                      </td>
                      <td className="py-3 px-4 text-right text-amber-100 font-semibold text-xs">
                        {formatCurrency(Number(order.totalAmount))}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px]">
                          {order.paymentStatus}
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
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-amber-100">
            Relatórios
          </h1>
          <p className="text-amber-100/40 text-sm mt-1">
            Gere relatórios detalhados do seu negócio
          </p>
        </div>
        {data && (
          <Button
            onClick={exportCSV}
            variant="outline"
            className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            variant={reportType === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => setReportType(tab.value)}
            className={
              reportType === tab.value
                ? "bg-amber-500 hover:bg-amber-600 text-black font-medium gap-2"
                : "border-amber-500/20 text-amber-100/60 hover:text-amber-300 gap-2"
            }
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-amber-100/70 text-xs">De</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-[#120a04] border-amber-500/20 text-amber-100 w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-amber-100/70 text-xs">Até</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-[#120a04] border-amber-500/20 text-amber-100 w-40"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchReport}
          disabled={loading}
          className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
        >
          Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-24 bg-amber-500/5 rounded-xl" />
          <div className="h-64 bg-amber-500/5 rounded-xl" />
        </div>
      ) : (
        <>
          {reportType === "sales" && renderSalesReport()}
          {reportType === "products" && renderProductsReport()}
          {reportType === "customers" && renderCustomersReport()}
          {reportType === "financial" && renderFinancialReport()}
        </>
      )}
    </div>
  );
}
