"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  Tag,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Percent,
  DollarSign,
  Calendar,
  Loader2,
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
import toast from "react-hot-toast";
import { formatDate, formatCurrency, cn } from "@/lib/utils";

interface CouponData {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string | null;
  createdAt: string;
  orders: { id: string; orderNumber: string; totalAmount: number; createdAt: string }[];
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDiscountType, setFormDiscountType] = useState("PERCENTAGE");
  const [formDiscountValue, setFormDiscountValue] = useState("");
  const [formMinOrderValue, setFormMinOrderValue] = useState("");
  const [formMaxUses, setFormMaxUses] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formValidFrom, setFormValidFrom] = useState("");
  const [formValidUntil, setFormValidUntil] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const resetForm = () => {
    setFormCode("");
    setFormDescription("");
    setFormDiscountType("PERCENTAGE");
    setFormDiscountValue("");
    setFormMinOrderValue("");
    setFormMaxUses("");
    setFormIsActive(true);
    setFormValidFrom("");
    setFormValidUntil("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (coupon: CouponData) => {
    setFormCode(coupon.code);
    setFormDescription(coupon.description || "");
    setFormDiscountType(coupon.discountType);
    setFormDiscountValue(String(coupon.discountValue));
    setFormMinOrderValue(coupon.minOrderValue ? String(coupon.minOrderValue) : "");
    setFormMaxUses(coupon.maxUses ? String(coupon.maxUses) : "");
    setFormIsActive(coupon.isActive);
    setFormValidFrom(coupon.validFrom ? coupon.validFrom.slice(0, 10) : "");
    setFormValidUntil(coupon.validUntil ? coupon.validUntil.slice(0, 10) : "");
    setEditingId(coupon.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formDiscountValue) {
      toast.error("Código e valor são obrigatórios");
      return;
    }

    setSubmitting(true);
    try {
      const body: any = {
        code: formCode,
        description: formDescription || null,
        discountType: formDiscountType,
        discountValue: parseFloat(formDiscountValue),
        minOrderValue: formMinOrderValue ? parseFloat(formMinOrderValue) : 0,
        maxUses: formMaxUses ? parseInt(formMaxUses) : 0,
        isActive: formIsActive,
        validFrom: formValidFrom || undefined,
        validUntil: formValidUntil || null,
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/admin/coupons/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/admin/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar");
      }

      toast.success(editingId ? "Cupom atualizado!" : "Cupom criado!");
      resetForm();
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este cupom?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao remover");
      toast.success("Cupom removido");
      fetchCoupons();
    } catch {
      toast.error("Erro ao remover cupom");
    }
  };

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredCoupons.length / ITEMS_PER_PAGE);
  const paginatedCoupons = filteredCoupons.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-amber-500/5 rounded" />
        <div className="h-10 w-full bg-amber-500/5 rounded" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-amber-500/5 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-amber-100">Cupons de Desconto</h1>
          <p className="text-amber-100/40 text-sm mt-1">{coupons.length} cupom{coupons.length !== 1 ? "ns" : ""}</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-amber-500 hover:bg-amber-600 text-black font-medium gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Cupom
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-100/30" />
        <Input
          placeholder="Buscar por código ou descrição..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-10 bg-[#120a04] border-amber-500/20 text-amber-100 placeholder:text-amber-100/30"
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-xl border border-amber-500/20 bg-[#1a0f07] space-y-4">
          <h3 className="text-amber-100 font-display text-lg">
            {editingId ? "Editar Cupom" : "Novo Cupom"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-amber-100/70 text-sm block mb-1">Código *</label>
              <Input
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                placeholder="EX: BEMVINDO10"
                className="bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30"
              />
            </div>
            <div>
              <label className="text-amber-100/70 text-sm block mb-1">Tipo</label>
              <Select value={formDiscountType} onValueChange={setFormDiscountType}>
                <SelectTrigger className="bg-[#120a04] border-amber-500/30 text-amber-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentual (%)</SelectItem>
                  <SelectItem value="FIXED">Valor Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-amber-100/70 text-sm block mb-1">
                {formDiscountType === "PERCENTAGE" ? "Desconto (%)" : "Desconto (R$)"} *
              </label>
              <Input
                type="number"
                step="0.01"
                value={formDiscountValue}
                onChange={(e) => setFormDiscountValue(e.target.value)}
                className="bg-[#120a04] border-amber-500/30 text-amber-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-amber-100/70 text-sm block mb-1">Valor Mínimo do Pedido</label>
              <Input
                type="number"
                step="0.01"
                value={formMinOrderValue}
                onChange={(e) => setFormMinOrderValue(e.target.value)}
                placeholder="0 = sem mínimo"
                className="bg-[#120a04] border-amber-500/30 text-amber-100"
              />
            </div>
            <div>
              <label className="text-amber-100/70 text-sm block mb-1">Limite de Usos</label>
              <Input
                type="number"
                value={formMaxUses}
                onChange={(e) => setFormMaxUses(e.target.value)}
                placeholder="0 = ilimitado"
                className="bg-[#120a04] border-amber-500/30 text-amber-100"
              />
            </div>
          </div>
          <div>
            <label className="text-amber-100/70 text-sm block mb-1">Descrição</label>
            <Input
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Ex: 10% de desconto na primeira compra"
              className="bg-[#120a04] border-amber-500/30 text-amber-100"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-amber-100/70 text-sm block mb-1">Válido De</label>
              <Input
                type="date"
                value={formValidFrom}
                onChange={(e) => setFormValidFrom(e.target.value)}
                className="bg-[#120a04] border-amber-500/30 text-amber-100"
              />
            </div>
            <div>
              <label className="text-amber-100/70 text-sm block mb-1">Válido Até</label>
              <Input
                type="date"
                value={formValidUntil}
                onChange={(e) => setFormValidUntil(e.target.value)}
                className="bg-[#120a04] border-amber-500/30 text-amber-100"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="rounded border-amber-500/30 bg-[#120a04] text-amber-500"
              />
              <span className="text-amber-100/70 text-sm">Ativo</span>
            </label>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-black font-medium gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {submitting ? "Salvando..." : editingId ? "Atualizar" : "Criar Cupom"}
            </Button>
            <Button type="button" variant="ghost" onClick={resetForm} className="text-amber-100/60 hover:text-amber-300">
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {paginatedCoupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Tag className="h-12 w-12 text-amber-500/20 mb-4" />
          <h2 className="text-xl font-semibold text-amber-100 mb-2">Nenhum cupom encontrado</h2>
          <p className="text-amber-100/40 mb-6">
            {search ? "Tente ajustar a busca." : "Crie seu primeiro cupom de desconto."}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paginatedCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-amber-500/20 bg-[#120a04]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-amber-100 font-bold text-lg">{coupon.code}</span>
                    <Badge className={cn(
                      "text-[10px] border-0",
                      coupon.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    )}>
                      {coupon.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge className="bg-amber-500/10 text-amber-400 text-[10px] border-0">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}%`
                        : formatCurrency(coupon.discountValue)}
                    </Badge>
                  </div>
                  {coupon.description && (
                    <p className="text-amber-100/40 text-xs mt-1 truncate">{coupon.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-amber-100/30 flex-wrap">
                    {coupon.minOrderValue > 0 && <span>Mín: {formatCurrency(coupon.minOrderValue)}</span>}
                    <span>Usos: {coupon.usedCount}{coupon.maxUses > 0 ? `/${coupon.maxUses}` : ""}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(coupon.validFrom)}{coupon.validUntil ? ` até ${formatDate(coupon.validUntil)}` : ""}</span>
                    <span>{coupon.orders.length} pedido{coupon.orders.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(coupon)} className="text-amber-300 hover:text-amber-100 hover:bg-amber-500/10">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(coupon.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="border-amber-500/20 text-amber-100/60 hover:text-amber-300">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-amber-100/60 px-4">Página {page} de {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="border-amber-500/20 text-amber-100/60 hover:text-amber-300">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
