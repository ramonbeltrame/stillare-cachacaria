"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  ExternalLink,
  Send,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Invoice {
  id: string;
  nfeNumber: string | null;
  nfeKey: string | null;
  nfeUrl: string | null;
  pdfUrl: string | null;
  status: string;
  totalAmount: number | null;
  issuedAt: string | null;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    billingName: string;
    billingEmail: string;
    totalAmount: number;
  };
}

interface InvoicesResponse {
  invoices: Invoice[];
  total: number;
  pages: number;
}

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

export default function AdminNotasFiscaisPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/invoices?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao carregar");
      const data: InvoicesResponse = await res.json();
      setInvoices(data.invoices);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch {
      toast.error("Erro ao carregar notas fiscais");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleResend = async (invoiceId: string) => {
    setResendingId(invoiceId);
    try {
      const res = await fetch("/api/invoices/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      if (!res.ok) throw new Error("Erro ao reenviar");
      toast.success("Nota fiscal reenviada com sucesso!");
    } catch {
      toast.error("Erro ao reenviar nota fiscal");
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-amber-100">
            Notas Fiscais
          </h1>
          <p className="text-amber-100/40 text-sm mt-1">
            {total} nota{total !== 1 ? "s" : ""} fiscal
            {total !== 1 ? "is" : ""} encontrada{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48 bg-[#120a04] border-amber-500/20 text-amber-100">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="PENDING">Pendente</SelectItem>
            <SelectItem value="AUTHORIZED">Autorizada</SelectItem>
            <SelectItem value="CANCELLED">Cancelada</SelectItem>
            <SelectItem value="REJECTED">Rejeitada</SelectItem>
            <SelectItem value="FAILED">Falha</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 bg-amber-500/5 rounded-lg" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FileText className="h-12 w-12 text-amber-500/20 mb-4" />
          <h2 className="text-xl font-semibold text-amber-100 mb-2">
            Nenhuma nota fiscal encontrada
          </h2>
          <p className="text-amber-100/40 text-sm">
            {statusFilter !== "all"
              ? "Tente ajustar o filtro de status."
              : "As notas fiscais emitidas aparecerão aqui."}
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
                      NFe Nº
                    </th>
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
                      Chave
                    </th>
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
                      Status
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
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-amber-500/10 hover:bg-amber-500/5 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-amber-300 text-xs">
                          {invoice.nfeNumber || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-amber-100/40 text-[10px] font-mono truncate max-w-[150px] block">
                          {invoice.nfeKey
                            ? invoice.nfeKey.slice(0, 20) + "..."
                            : "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-amber-300 text-xs">
                          {invoice.order?.orderNumber || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-amber-100 text-xs">
                          {invoice.order?.billingName || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-amber-100 font-semibold text-xs">
                        {formatCurrency(
                          Number(invoice.totalAmount || invoice.order?.totalAmount || 0)
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`${INVOICE_STATUS_COLORS[invoice.status] || "bg-gray-500/10 text-gray-400"} border-0 text-[10px] font-medium`}
                        >
                          {INVOICE_STATUS_LABELS[invoice.status] ||
                            invoice.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-amber-100/60 text-xs">
                        {formatDate(invoice.issuedAt || invoice.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {invoice.pdfUrl && (
                            <a
                              href={invoice.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-amber-100/40 hover:text-amber-300"
                                aria-label="Download PDF"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                          )}
                          {invoice.nfeUrl && (
                            <a
                              href={invoice.nfeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-amber-100/40 hover:text-amber-300"
                                aria-label="Portal da NFe"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResend(invoice.id)}
                            disabled={resendingId === invoice.id}
                            className="h-7 w-7 text-amber-100/40 hover:text-amber-300"
                            aria-label="Reenviar por email"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </div>
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
