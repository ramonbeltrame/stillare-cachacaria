"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Save,
  Package,
  ShoppingBag,
  Heart,
  MapPin,
  DollarSign,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";

const profileSchema = z.object({
  fullName: z.string().min(3, "Nome muito curto"),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function maskPhone(value: string): string {
  value = value.replace(/\D/g, "");
  if (value.length === 11)
    return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
  if (value.length === 10)
    return `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
  return value;
}

function maskCpf(value: string): string {
  if (!value) return "";
  value = value.replace(/\D/g, "");
  if (value.length > 9)
    return (
      value.slice(0, 3) +
      "." +
      value.slice(3, 6) +
      "." +
      value.slice(6, 9) +
      "-" +
      value.slice(9, 11)
    );
  return value;
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  cpf?: string | null;
  dateOfBirth?: string;
}

interface OrderSummary {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Array<{ id: string; productName: string; quantity: number; unitPrice: number }>;
}

interface DashboardData {
  lastOrder: OrderSummary | null;
  totalOrders: number;
  totalSpent: number;
  recentOrders: OrderSummary[];
}

export default function MinhaContaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashLoading, setDashLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/minha-conta");
      return;
    }
    if (status === "loading") return;

    async function fetchProfile() {
      try {
        const res = await fetch("/api/minha-conta");
        if (res.ok) {
          const data = await res.json();
          const user = data.user || data;
          setProfile(user);
          form.reset({
            fullName: user.fullName || "",
            phone: user.phone || "",
          });
        }
      } catch {} finally {
        setLoading(false);
      }
    }

    async function fetchDashboard() {
      try {
        const res = await fetch("/api/minha-conta/dashboard");
        if (res.ok) {
          const data = await res.json();
          setDashboard(data);
        }
      } catch {} finally {
        setDashLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchProfile();
      fetchDashboard();
    }
  }, [status, router, form]);

  const handleSave = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/minha-conta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("Dados atualizados com sucesso!");
      } else {
        throw new Error("Erro ao salvar");
      }
    } catch {
      toast.error("Erro ao salvar alterações");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div
        className="min-h-[70vh] flex items-center justify-center"
        style={{ backgroundColor: "#120a04" }}
      >
        <div className="animate-pulse space-y-4 w-full max-w-lg">
          <div className="h-8 w-48 rounded bg-amber-500/5 mx-auto" />
          <div className="h-64 rounded-xl bg-amber-500/5" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="min-h-[70vh] flex items-center justify-center"
        style={{ backgroundColor: "#120a04" }}
      >
        <p className="text-amber-100/40">Perfil não encontrado.</p>
      </div>
    );
  }

  const statusIcon: Record<string, React.ReactNode> = {
    PENDING: <Clock className="h-4 w-4" />,
    PAID: <CheckCircle className="h-4 w-4" />,
    PROCESSING: <Clock className="h-4 w-4" />,
    SHIPPED: <Truck className="h-4 w-4" />,
    DELIVERED: <CheckCircle className="h-4 w-4" />,
    CANCELLED: <XCircle className="h-4 w-4" />,
  };

  return (
    <div style={{ backgroundColor: "#120a04" }}>
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <h1 className="font-display text-3xl text-amber-100 mb-2">
          Minha Conta
        </h1>
        <p className="text-amber-100/40 font-light mb-10">
          Gerencie suas informações e acompanhe seus pedidos
        </p>

        {/* Dashboard Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Última Compra */}
          <div
            className="p-6 rounded-xl border border-amber-500/20"
            style={{ backgroundColor: "#1a0f07" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-amber-400" />
              </div>
              <h2 className="font-display text-lg text-amber-100">Última Compra</h2>
            </div>
            {dashLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 w-32 bg-amber-500/5 rounded" />
                <div className="h-4 w-24 bg-amber-500/5 rounded" />
                <div className="h-4 w-20 bg-amber-500/5 rounded" />
              </div>
            ) : dashboard?.lastOrder ? (
              <div className="space-y-2">
                <p className="text-amber-300 font-display text-sm">
                  #{dashboard.lastOrder.orderNumber}
                </p>
                <p className="text-amber-100/40 text-xs">
                  {formatDate(dashboard.lastOrder.createdAt)}
                </p>
                <p className="text-amber-400 font-bold text-xl">
                  {formatCurrency(dashboard.lastOrder.totalAmount)}
                </p>
                <div className="flex items-center gap-2">
                  <Badge className={getOrderStatusColor(dashboard.lastOrder.status)}>
                    {getOrderStatusLabel(dashboard.lastOrder.status)}
                  </Badge>
                  <Link
                    href={`/meus-pedidos/${dashboard.lastOrder.id}`}
                    className="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1 transition-colors"
                  >
                    Ver detalhes <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-2">
                <p className="text-amber-100/30 text-sm">Nenhuma compra realizada</p>
                <Link
                  href="/produtos"
                  className="text-amber-400 hover:text-amber-300 text-xs mt-1 inline-block"
                >
                  Ir para a loja
                </Link>
              </div>
            )}
          </div>

          {/* Resumo */}
          <div
            className="p-6 rounded-xl border border-amber-500/20"
            style={{ backgroundColor: "#1a0f07" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-amber-400" />
              </div>
              <h2 className="font-display text-lg text-amber-100">Resumo</h2>
            </div>
            {dashLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-6 w-40 bg-amber-500/5 rounded" />
                <div className="h-6 w-32 bg-amber-500/5 rounded" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-amber-100/40 text-xs mb-0.5">Total de pedidos</p>
                  <p className="text-amber-100 text-2xl font-bold">
                    {dashboard?.totalOrders || 0}
                  </p>
                </div>
                <div>
                  <p className="text-amber-100/40 text-xs mb-0.5">Total gasto na loja</p>
                  <p className="text-amber-400 text-2xl font-bold">
                    {formatCurrency(dashboard?.totalSpent || 0)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Atalhos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          <Link
            href="/meus-pedidos"
            className="flex items-center gap-3 p-4 rounded-lg border border-amber-500/20 bg-[#1a0f07] hover:border-amber-500/40 transition-all group"
          >
            <ShoppingBag className="h-5 w-5 text-amber-400 group-hover:text-amber-300" />
            <span className="text-amber-100 group-hover:text-amber-300 text-sm font-medium">
              Meus Pedidos
            </span>
          </Link>
          <Link
            href="/enderecos"
            className="flex items-center gap-3 p-4 rounded-lg border border-amber-500/20 bg-[#1a0f07] hover:border-amber-500/40 transition-all group"
          >
            <MapPin className="h-5 w-5 text-amber-400 group-hover:text-amber-300" />
            <span className="text-amber-100 group-hover:text-amber-300 text-sm font-medium">
              Meus Endereços
            </span>
          </Link>
          <Link
            href="/favoritos"
            className="flex items-center gap-3 p-4 rounded-lg border border-amber-500/20 bg-[#1a0f07] hover:border-amber-500/40 transition-all group"
          >
            <Heart className="h-5 w-5 text-amber-400 group-hover:text-amber-300" />
            <span className="text-amber-100 group-hover:text-amber-300 text-sm font-medium">
              Favoritos
            </span>
          </Link>
        </div>

        {/* Pedidos Recentes */}
        <div
          className="p-6 rounded-xl border border-amber-500/20 mb-10"
          style={{ backgroundColor: "#1a0f07" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <h2 className="font-display text-lg text-amber-100">Pedidos Recentes</h2>
            </div>
            {dashboard && dashboard.recentOrders.length > 0 && (
              <Link
                href="/meus-pedidos"
                className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
              >
                Ver todos
              </Link>
            )}
          </div>

          {dashLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-amber-500/5 rounded" />
              ))}
            </div>
          ) : !dashboard || dashboard.recentOrders.length === 0 ? (
            <p className="text-amber-100/30 text-sm py-4">Nenhum pedido ainda</p>
          ) : (
            <div className="space-y-2">
              {dashboard.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/meus-pedidos/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-amber-500/5 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Package className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-amber-300 text-xs font-medium">
                        #{order.orderNumber}
                      </p>
                      <p className="text-amber-100/30 text-xs truncate">
                        {order.items.slice(0, 2).map((i) => i.productName).join(", ")}
                        {order.items.length > 2 ? " + mais" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge className={getOrderStatusColor(order.status)}>
                      {getOrderStatusLabel(order.status)}
                    </Badge>
                    <span className="text-amber-100 text-sm font-medium">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-amber-100/10 group-hover:text-amber-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Info Card */}
          <div className="md:col-span-1">
            <div
              className="p-6 rounded-xl border border-amber-500/20"
              style={{ backgroundColor: "#1a0f07" }}
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-amber-400" />
              </div>
              <h2 className="text-amber-100 font-medium text-center text-lg truncate">
                {profile.fullName}
              </h2>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="text-amber-100/50 truncate">
                    {profile.email}
                  </span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="text-amber-100/50">{profile.phone}</span>
                  </div>
                )}
                {profile.cpf && (
                  <div className="flex items-center gap-3 text-sm">
                    <CreditCard className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="text-amber-100/50">
                      {maskCpf(profile.cpf)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="md:col-span-2">
            <div
              className="p-6 rounded-xl border border-amber-500/20"
              style={{ backgroundColor: "#1a0f07" }}
            >
              <h2 className="font-display text-lg text-amber-100 mb-6">
                Editar Informações
              </h2>
              <form
                onSubmit={form.handleSubmit(handleSave)}
                className="space-y-4"
              >
                <div>
                  <Label className="text-amber-100">Nome completo</Label>
                  <Input
                    {...form.register("fullName")}
                    className="bg-[#120a04] border-amber-500/30 text-amber-100 focus-visible:ring-amber-500"
                  />
                  {form.formState.errors.fullName && (
                    <p className="text-red-400 text-xs mt-1">
                      {form.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-amber-100">E-mail</Label>
                  <Input
                    value={profile.email}
                    disabled
                    className="bg-[#120a04] border-amber-500/30 text-amber-100/50 cursor-not-allowed"
                  />
                  <p className="text-amber-100/30 text-xs mt-1">
                    O e-mail não pode ser alterado.
                  </p>
                </div>

                <div>
                  <Label className="text-amber-100">Telefone</Label>
                  <Input
                    {...form.register("phone")}
                    placeholder="(00) 00000-0000"
                    onChange={(e) =>
                      form.setValue("phone", maskPhone(e.target.value))
                    }
                    className="bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold"
                >
                  {saving ? (
                    "Salvando..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
