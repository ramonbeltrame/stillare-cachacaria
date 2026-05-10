"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  formatDate,
  maskCpf,
  maskPhone,
} from "@/lib/utils";
import toast from "react-hot-toast";

interface Customer {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  cpf: string | null;
  dateOfBirth: string;
  status: string;
  lastLogin: string | null;
  createdAt: string;
  _count: { orders: number };
}

interface CustomersResponse {
  users: Customer[];
  total: number;
  pages: number;
}

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

export default function AdminCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao carregar clientes");
      const data: CustomersResponse = await res.json();
      setCustomers(data.users);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch {
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchCustomers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-amber-100">
            Clientes
          </h1>
          <p className="text-amber-100/40 text-sm mt-1">
            {total} cliente{total !== 1 ? "s" : ""} cadastrado
            {total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-100/30" />
        <Input
          placeholder="Buscar por nome, email ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[#120a04] border-amber-500/20 text-amber-100 placeholder:text-amber-100/30"
        />
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 bg-amber-500/5 rounded-lg" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Users className="h-12 w-12 text-amber-500/20 mb-4" />
          <h2 className="text-xl font-semibold text-amber-100 mb-2">
            Nenhum cliente encontrado
          </h2>
          <p className="text-amber-100/40 text-sm">
            {search
              ? "Tente ajustar sua busca."
              : "Os clientes cadastrados aparecerão aqui."}
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
                      Nome
                    </th>
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
                      CPF
                    </th>
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="text-center py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
                      Pedidos
                    </th>
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
                      Cadastro
                    </th>
                    <th className="text-right py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-amber-500/10 hover:bg-amber-500/5 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(`/admin/clientes/${customer.id}`)
                      }
                    >
                      <td className="py-3 px-4">
                        <span className="text-amber-100 font-medium">
                          {customer.fullName}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-amber-100/60 text-xs">
                        {customer.email}
                      </td>
                      <td className="py-3 px-4 text-amber-100/60 text-xs font-mono">
                        {customer.cpf ? maskCpf(customer.cpf) : "—"}
                      </td>
                      <td className="py-3 px-4 text-amber-100/60 text-xs">
                        {customer.phone ? maskPhone(customer.phone) : "—"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-amber-100 font-semibold">
                          {customer._count?.orders || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`${STATUS_COLORS[customer.status] || "bg-gray-500/10 text-gray-400"} border-0 text-[10px] font-medium`}
                        >
                          {STATUS_LABELS[customer.status] || customer.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-amber-100/60 text-xs">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/clientes/${customer.id}`);
                          }}
                          className="h-8 w-8 text-amber-100/50 hover:text-amber-300"
                          aria-label={`Ver cliente ${customer.fullName}`}
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
