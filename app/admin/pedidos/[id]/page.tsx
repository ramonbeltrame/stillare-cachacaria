"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  Truck,
  Package,
  CreditCard,
  FileText,
  User,
  MapPin,
  Clock,
  RefreshCw,
  Send,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getOrderStatusLabel,
  getOrderStatusColor,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  maskCpf,
  maskPhone,
} from "@/lib/utils";
import toast from "react-hot-toast";

const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const INVOICE_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  AUTHORIZED: "Autorizada",
  CANCELLED: "Cancelada",
  REJECTED: "Rejeitada",
  FAILED: "Falha",
};

const INVOICE_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400",
  AUTHORIZED: "bg-emerald-500/10 text-emerald-400",
  CANCELLED: "bg-red-500/10 text-red-400",
  REJECTED: "bg-red-500/10 text-red-400",
  FAILED: "bg-red-500/10 text-red-400",
};

const TRACKING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  IN_TRANSIT: "Em trânsito",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  DELIVERED: "Entregue",
  FAILED: "Falha na entrega",
  RETURNED: "Devolvido",
};

interface AuditLog {
  id: string;
  action: string;
  oldValues: any;
  newValues: any;
  createdAt: string;
  admin: { fullName: string; email: string };
}

export default function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const orderId = params.id;

  const [order, setOrder] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [resendingInvoice, setResendingInvoice] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Pedido não encontrado");
        return res.json();
      })
      .then((data) => {
        setOrder(data.order);
        setAuditLogs(data.auditLogs || []);
        setStatus(data.order.status);
        setTrackingCode(data.order.trackingCode || "");
        setAdminNotes(data.order.adminNotes || "");
      })
      .catch(() => {
        toast.error("Erro ao carregar pedido");
        router.push("/admin/pedidos");
      })
      .finally(() => setLoading(false));
  }, [orderId, router]);

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status,
          trackingCode: trackingCode || null,
          adminNotes,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      const data = await res.json();
      setOrder(data.order);
      toast.success("Pedido atualizado com sucesso!");
    } catch {
      toast.error("Erro ao atualizar pedido");
    } finally {
      setSaving(false);
    }
  };

  const handleResendInvoice = async () => {
    if (!order?.invoice?.id) return;
    setResendingInvoice(true);
    try {
      const res = await fetch("/api/invoices/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: order.invoice.id }),
      });
      if (!res.ok) throw new Error("Erro ao reenviar");
      toast.success("Nota fiscal reenviada com sucesso!");
    } catch {
      toast.error("Erro ao reenviar nota fiscal");
    } finally {
      setResendingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-amber-500/5 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-amber-500/5 rounded-xl" />
            <div className="h-48 bg-amber-500/5 rounded-xl" />
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-amber-500/5 rounded-xl" />
            <div className="h-32 bg-amber-500/5 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-amber-100 mb-2">
          Pedido não encontrado
        </h2>
        <Button
          onClick={() => router.push("/admin/pedidos")}
          variant="outline"
          className="mt-4 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
        >
          Voltar para pedidos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                Pedido {order.orderNumber}
              </h1>
              <Badge
                className={`${getOrderStatusColor(order.status)} border-0 text-[11px]`}
              >
                {getOrderStatusLabel(order.status)}
              </Badge>
            </div>
            <p className="text-amber-100/40 text-sm mt-1">
              {formatDateTime(order.createdAt)} · ID: {order.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-48 bg-[#120a04] border-amber-500/20 text-amber-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {getOrderStatusLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleSaveChanges}
            disabled={saving}
            className="bg-amber-500 hover:bg-amber-600 text-black font-medium gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#120a04] border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-amber-400" />
                Itens do Pedido
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
                        SKU
                      </th>
                      <th className="text-center py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                        Qtde
                      </th>
                      <th className="text-right py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                        Unitário
                      </th>
                      <th className="text-right py-3 px-4 text-amber-100/50 text-xs font-medium uppercase">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item: any) => (
                      <tr
                        key={item.id}
                        className="border-b border-amber-500/10"
                      >
                        <td className="py-3 px-4 text-amber-100 font-medium">
                          {item.productName}
                        </td>
                        <td className="py-3 px-4 text-amber-100/40 text-xs font-mono">
                          {item.product?.sku || "—"}
                        </td>
                        <td className="py-3 px-4 text-center text-amber-100">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4 text-right text-amber-100/60">
                          {formatCurrency(Number(item.unitPrice))}
                        </td>
                        <td className="py-3 px-4 text-right text-amber-100 font-semibold">
                          {formatCurrency(
                            Number(item.unitPrice) * item.quantity
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Separator className="my-4 bg-amber-500/10" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-amber-100/50">Subtotal</span>
                  <span className="text-amber-100">
                    {formatCurrency(Number(order.subtotal))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-amber-100/50">Frete</span>
                  <span className="text-amber-100">
                    {formatCurrency(Number(order.shippingCost))}
                  </span>
                </div>
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-100/50">Desconto</span>
                    <span className="text-emerald-400">
                      -{formatCurrency(Number(order.discountAmount))}
                    </span>
                  </div>
                )}
                <Separator className="bg-amber-500/10" />
                <div className="flex justify-between text-base font-bold">
                  <span className="text-amber-100">Total</span>
                  <span className="text-amber-400">
                    {formatCurrency(Number(order.totalAmount))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#120a04] border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-amber-400" />
                Rastreamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="trackingCode" className="text-amber-100/70">
                  Código de Rastreio
                </Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="trackingCode"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Ex: AA123456789BR"
                    className="flex-1 bg-[#1a0f05] border-amber-500/20 text-amber-100"
                  />
                </div>
              </div>

              {order.shippingTracking && (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-amber-100/70">Status:</span>
                    <Badge className="bg-blue-500/10 text-blue-400 border-0 text-[10px]">
                      {TRACKING_STATUS_LABELS[
                        order.shippingTracking.status
                      ] || order.shippingTracking.status}
                    </Badge>
                  </div>
                  {order.shippingTracking.lastLocation && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-amber-100/70">
                        Última localização:
                      </span>
                      <span className="text-sm text-amber-100">
                        {order.shippingTracking.lastLocation}
                      </span>
                    </div>
                  )}
                  {order.shippingTracking.estimatedDelivery && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-amber-100/70">
                        Previsão de entrega:
                      </span>
                      <span className="text-sm text-amber-100">
                        {formatDate(
                          order.shippingTracking.estimatedDelivery
                        )}
                      </span>
                    </div>
                  )}
                  {order.shippingTracking.events &&
                    Array.isArray(order.shippingTracking.events) &&
                    order.shippingTracking.events.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <span className="text-xs text-amber-100/50 font-medium uppercase tracking-wider">
                          Histórico de Eventos
                        </span>
                        <div className="space-y-2">
                          {(order.shippingTracking.events as any[]).map(
                            (event: any, i: number) => (
                              <div
                                key={i}
                                className="flex items-start gap-3 p-3 bg-amber-500/5 rounded-lg"
                              >
                                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                <div>
                                  <p className="text-sm text-amber-100">
                                    {event.description || event.status}
                                  </p>
                                  <p className="text-xs text-amber-100/40">
                                    {event.date
                                      ? formatDateTime(event.date)
                                      : ""}
                                    {event.location
                                      ? ` · ${event.location}`
                                      : ""}
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#120a04] border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-400" />
                Nota Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.invoice ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-amber-100/40">
                        Status
                      </span>
                      <div className="mt-1">
                        <Badge
                          className={`${INVOICE_STATUS_COLORS[order.invoice.status] || "bg-gray-500/10 text-gray-400"} border-0 text-[10px]`}
                        >
                          {INVOICE_STATUS_LABELS[order.invoice.status] ||
                            order.invoice.status}
                        </Badge>
                      </div>
                    </div>
                    {order.invoice.nfeNumber && (
                      <div>
                        <span className="text-xs text-amber-100/40">
                          Número
                        </span>
                        <p className="text-amber-100 text-sm mt-1">
                          {order.invoice.nfeNumber}
                        </p>
                      </div>
                    )}
                    {order.invoice.nfeKey && (
                      <div>
                        <span className="text-xs text-amber-100/40">
                          Chave de Acesso
                        </span>
                        <p className="text-amber-100 font-mono text-xs mt-1 break-all">
                          {order.invoice.nfeKey}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.invoice.pdfUrl && (
                      <a
                        href={order.invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 gap-1.5"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Download PDF
                        </Button>
                      </a>
                    )}
                    {order.invoice.nfeUrl && (
                      <a
                        href={order.invoice.nfeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 gap-1.5"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Portal da NFe
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendInvoice}
                      disabled={resendingInvoice}
                      className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 gap-1.5"
                    >
                      {resendingInvoice ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      {resendingInvoice
                        ? "Reenviando..."
                        : "Reenviar por Email"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-10 w-10 text-amber-500/20 mb-3" />
                  <p className="text-amber-100/40 text-sm">
                    Nenhuma nota fiscal emitida para este pedido.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#120a04] border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" />
                Anotações do Admin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Adicione anotações internas sobre este pedido..."
                rows={3}
                className="bg-[#1a0f05] border-amber-500/20 text-amber-100 resize-none"
              />
            </CardContent>
          </Card>

          <Card className="bg-[#120a04] border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" />
                Histórico de Alterações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-amber-100/40 text-sm text-center py-4">
                  Nenhuma alteração registrada.
                </p>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-amber-500/5 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-amber-100 font-medium">
                          {log.action === "UPDATE_ORDER"
                            ? "Pedido atualizado"
                            : log.action}
                        </span>
                        <span className="text-xs text-amber-100/40">
                          {formatDateTime(log.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-amber-100/40 mt-1">
                        por {log.admin?.fullName || log.admin?.email || "Admin"}
                      </p>
                      {log.oldValues && log.newValues && (
                        <div className="mt-2 text-xs space-y-0.5">
                          {log.oldValues.status !== log.newValues.status && (
                            <p className="text-amber-100/50">
                              Status:{" "}
                              <span className="line-through text-red-400/60">
                                {getOrderStatusLabel(log.oldValues.status)}
                              </span>{" "}
                              →{" "}
                              <span className="text-emerald-400">
                                {getOrderStatusLabel(log.newValues.status)}
                              </span>
                            </p>
                          )}
                          {log.oldValues.trackingCode !==
                            log.newValues.trackingCode && (
                            <p className="text-amber-100/50">
                              Rastreio:{" "}
                              <span className="line-through text-red-400/60">
                                {log.oldValues.trackingCode || "—"}
                              </span>{" "}
                              →{" "}
                              <span className="text-emerald-400">
                                {log.newValues.trackingCode || "—"}
                              </span>
                            </p>
                          )}
                          {log.oldValues.adminNotes !==
                            log.newValues.adminNotes && (
                            <p className="text-amber-100/50">
                              Anotações atualizadas
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#120a04] border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-amber-400" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-xs text-amber-100/40">Nome</span>
                <p className="text-amber-100 text-sm">
                  {order.billingName || "—"}
                </p>
              </div>
              <div>
                <span className="text-xs text-amber-100/40">Email</span>
                <p className="text-amber-100 text-sm">
                  {order.billingEmail || "—"}
                </p>
              </div>
              {order.billingCpf && (
                <div>
                  <span className="text-xs text-amber-100/40">CPF</span>
                  <p className="text-amber-100 text-sm font-mono">
                    {maskCpf(order.billingCpf)}
                  </p>
                </div>
              )}
              {order.billingPhone && (
                <div>
                  <span className="text-xs text-amber-100/40">Telefone</span>
                  <p className="text-amber-100 text-sm">
                    {maskPhone(order.billingPhone)}
                  </p>
                </div>
              )}
              {order.user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/clientes/${order.user.id}`)
                  }
                  className="text-amber-300 hover:text-amber-100 hover:bg-amber-500/10"
                >
                  Ver perfil completo
                </Button>
              )}
            </CardContent>
          </Card>

          {order.shippingAddress && (
            <Card className="bg-[#120a04] border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-amber-400" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-xs text-amber-100/40">
                    Destinatário
                  </span>
                  <p className="text-amber-100 text-sm">
                    {order.shippingAddress.recipientName}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-amber-100/40">Endereço</span>
                  <p className="text-amber-100 text-sm">
                    {order.shippingAddress.street},{" "}
                    {order.shippingAddress.number}
                    {order.shippingAddress.complement
                      ? ` - ${order.shippingAddress.complement}`
                      : ""}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-amber-100/40">
                    Bairro / Cidade / Estado
                  </span>
                  <p className="text-amber-100 text-sm">
                    {order.shippingAddress.neighborhood} ·{" "}
                    {order.shippingAddress.city} /{" "}
                    {order.shippingAddress.state}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-amber-100/40">CEP</span>
                  <p className="text-amber-100 text-sm font-mono">
                    {order.shippingAddress.zipCode}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-[#120a04] border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-400" />
                Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-xs text-amber-100/40">Status</span>
                <div className="mt-1">
                  <Badge
                    className={`${getPaymentStatusColor(order.paymentStatus)} border-0 text-[10px]`}
                  >
                    {getPaymentStatusLabel(order.paymentStatus)}
                  </Badge>
                </div>
              </div>
              {order.transactions?.length > 0 && (
                <div>
                  <span className="text-xs text-amber-100/40">
                    Transações
                  </span>
                  <div className="mt-2 space-y-2">
                    {order.transactions.map((tx: any) => (
                      <div
                        key={tx.id}
                        className="p-2 bg-amber-500/5 rounded text-xs"
                      >
                        <p className="text-amber-100">
                          {tx.paymentMethod} ·{" "}
                          {formatCurrency(Number(tx.amount))}
                        </p>
                        <p className="text-amber-100/40">
                          {tx.status}
                          {tx.mercadoPagoId &&
                            ` · MP: ${tx.mercadoPagoId}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
