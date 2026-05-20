"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Mail,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface EmailLog {
  id: string;
  userId?: string | null;
  recipientEmail: string;
  subject?: string | null;
  emailType: string;
  status: string;
  errorMessage?: string | null;
  createdAt: string;
}

const EMAIL_TYPES = [
  { value: "WELCOME", label: "Boas-vindas" },
  { value: "ORDER_CONFIRMATION", label: "Confirmação de Pedido" },
  { value: "ORDER_SHIPPED", label: "Pedido Enviado" },
  { value: "ORDER_DELIVERED", label: "Pedido Entregue" },
  { value: "INVOICE", label: "Nota Fiscal" },
  { value: "PASSWORD_RESET", label: "Redefinição de Senha" },
];

const STATUS_OPTIONS = [
  { value: "SENT", label: "Enviado" },
  { value: "FAILED", label: "Falhou" },
  { value: "PENDING", label: "Pendente" },
];

function getEmailTypeLabel(type: string): string {
  return EMAIL_TYPES.find((t) => t.value === type)?.label || type;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "SENT":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Enviado
        </Badge>
      );
    case "FAILED":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Falhou
        </Badge>
      );
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Pendente
        </Badge>
      );
  }
}

export default function AdminEmailsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "50");
      if (typeFilter) params.set("type", typeFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/emails?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalPages(data.pages || 1);
        setTotal(data.total || 0);
      } else if (res.status === 403) {
        toast.error("Acesso restrito");
      }
    } catch {
      toast.error("Erro ao carregar logs");
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, statusFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleTypeChange = (value: string) => {
    setTypeFilter(value === "ALL" ? "" : value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value === "ALL" ? "" : value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-zinc-100">
          Log de E-mails
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Histórico de e-mails transacionais enviados pela plataforma
        </p>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total de E-mails
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-zinc-100">{total}</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Enviados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-400">
              {logs.filter((l) => l.status === "SENT").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Falhas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-400">
              {logs.filter((l) => l.status === "FAILED").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={typeFilter || "ALL"} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[220px] bg-zinc-900 border-zinc-700 text-zinc-100">
            <Filter className="h-4 w-4 mr-2 text-zinc-400" />
            <SelectValue placeholder="Tipo de e-mail" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
            <SelectItem value="ALL">Todos os tipos</SelectItem>
            {EMAIL_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter || "ALL"} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-700 text-zinc-100">
            <Filter className="h-4 w-4 mr-2 text-zinc-400" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
            <SelectItem value="ALL">Todos os status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(typeFilter || statusFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTypeFilter("");
              setStatusFilter("");
              setPage(1);
            }}
            className="text-zinc-400 hover:text-zinc-100"
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Table */}
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Data
                </th>
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Destinatário
                </th>
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Assunto
                </th>
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Mail className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-500">
                      Nenhum log de e-mail encontrado
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="p-4 text-sm text-zinc-300 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="p-4 text-sm text-zinc-300 font-mono">
                      {log.recipientEmail}
                    </td>
                    <td className="p-4 text-sm text-zinc-400 max-w-[200px] truncate">
                      {log.subject || "—"}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="secondary"
                        className="bg-zinc-800 text-zinc-300 border-zinc-700"
                      >
                        {getEmailTypeLabel(log.emailType)}
                      </Badge>
                    </td>
                    <td className="p-4">{getStatusBadge(log.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">
              Mostrando {logs.length} de {total} registros
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-zinc-400 px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
