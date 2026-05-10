"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema } from "@/lib/validations";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  User,
  Home,
  Check,
  X,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AddressFormData = z.infer<typeof addressSchema>;

interface Address {
  id: string;
  recipientName: string;
  phone: string | null;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  createdAt: string;
}

const BRAZILIAN_STATES = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

function maskCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 11)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  if (digits.length > 2)
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return digits;
}

export default function EnderecosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      recipientName: "",
      phone: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
      isDefault: false,
    },
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = form;
  const watchedZipCode = watch("zipCode");

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      } else {
        toast.error("Erro ao carregar endereços");
      }
    } catch {
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/enderecos");
      return;
    }
    if (status === "loading") return;
    if (status === "authenticated") {
      fetchAddresses();
    }
  }, [status, router, fetchAddresses]);

  const fetchCep = useCallback(async () => {
    const cleanedZip = watchedZipCode?.replace(/\D/g, "") || "";
    if (cleanedZip.length !== 8) return;

    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanedZip}/json/`);
      const data = await res.json();
      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }
      setValue("street", data.logradouro || "");
      setValue("neighborhood", data.bairro || "");
      setValue("city", data.localidade || "");
      setValue("state", data.uf || "");
      if (!data.logradouro) {
        toast("Preencha o nome da rua manualmente", { icon: "⚠️" });
      }
    } catch {
      toast.error("Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  }, [watchedZipCode, setValue]);

  const handleCepBlur = () => {
    fetchCep();
  };

  const handleNewAddress = () => {
    reset({
      recipientName: "",
      phone: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
      isDefault: false,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (address: Address) => {
    reset({
      recipientName: address.recipientName,
      phone: address.phone || "",
      street: address.street,
      number: address.number,
      complement: address.complement || "",
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    reset();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este endereço?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Endereço excluído");
        fetchAddresses();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Erro ao excluir endereço");
      }
    } catch {
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setDeletingId(null);
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/addresses/${editingId}`
        : "/api/addresses";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(editingId ? "Endereço atualizado" : "Endereço cadastrado");
        setShowForm(false);
        setEditingId(null);
        reset();
        fetchAddresses();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Erro ao salvar endereço");
      }
    } catch {
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div
        className="min-h-[70vh] flex items-center justify-center"
        style={{ backgroundColor: "#120a04" }}
      >
        <div className="animate-pulse space-y-4 w-full max-w-2xl px-4">
          <div className="h-8 w-48 rounded bg-amber-500/5 mx-auto" />
          <div className="h-32 rounded-xl bg-amber-500/5" />
          <div className="h-32 rounded-xl bg-amber-500/5" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#120a04" }}>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="font-display text-3xl text-amber-100">Meus Endereços</h1>
            <p className="text-amber-100/40 font-light mt-1">
              Gerencie seus endereços de entrega
            </p>
          </div>
          {!showForm && (
            <Button
              onClick={handleNewAddress}
              className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold shrink-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Endereço
            </Button>
          )}
        </div>

        {showForm && (
          <div
            className="mb-8 rounded-xl border border-amber-500/20 p-6 animate-fade-in"
            style={{ backgroundColor: "#1a0f07" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg text-amber-100">
                {editingId ? "Editar Endereço" : "Novo Endereço"}
              </h2>
              <button
                onClick={handleCancelForm}
                className="text-amber-100/40 hover:text-amber-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-amber-100">Nome do destinatário *</Label>
                  <Input
                    {...register("recipientName")}
                    placeholder="Ex: João Silva"
                    className="bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500"
                  />
                  {errors.recipientName && (
                    <p className="text-red-400 text-xs mt-1">{errors.recipientName.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-amber-100">
                    CEP *
                    {cepLoading && (
                      <span className="ml-2 text-amber-400 text-xs animate-pulse">
                        Buscando...
                      </span>
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      {...register("zipCode")}
                      placeholder="00000-000"
                      maxLength={9}
                      onChange={(e) => setValue("zipCode", maskCep(e.target.value))}
                      onBlur={handleCepBlur}
                      className="bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500 pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-100/30 pointer-events-none" />
                  </div>
                  {errors.zipCode && (
                    <p className="text-red-400 text-xs mt-1">{errors.zipCode.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-amber-100">Telefone</Label>
                  <Input
                    {...register("phone")}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    onChange={(e) => setValue("phone", maskPhone(e.target.value))}
                    className="bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500"
                  />
                </div>

                <div>
                  <Label className="text-amber-100">Rua/Avenida *</Label>
                  <Input
                    {...register("street")}
                    placeholder="Nome da rua"
                    className="bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500"
                  />
                  {errors.street && (
                    <p className="text-red-400 text-xs mt-1">{errors.street.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-amber-100">Número *</Label>
                  <Input
                    {...register("number")}
                    placeholder="123"
                    className="bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500"
                  />
                  {errors.number && (
                    <p className="text-red-400 text-xs mt-1">{errors.number.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-amber-100">Complemento</Label>
                  <Input
                    {...register("complement")}
                    placeholder="Apto, bloco, etc."
                    className="bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500"
                  />
                </div>

                <div>
                  <Label className="text-amber-100">Bairro *</Label>
                  <Input
                    {...register("neighborhood")}
                    placeholder="Nome do bairro"
                    className="bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500"
                  />
                  {errors.neighborhood && (
                    <p className="text-red-400 text-xs mt-1">{errors.neighborhood.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-amber-100">Cidade *</Label>
                  <Input
                    {...register("city")}
                    placeholder="Nome da cidade"
                    className="bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500"
                  />
                  {errors.city && (
                    <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-amber-100">Estado *</Label>
                  <select
                    {...register("state")}
                    className="flex h-10 w-full rounded-md border border-amber-500/30 bg-[#120a04] px-3 py-2 text-sm text-amber-100 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    defaultValue=""
                  >
                    <option value="" disabled className="bg-[#120a04] text-amber-100/30">
                      Selecione...
                    </option>
                    {BRAZILIAN_STATES.map((s) => (
                      <option key={s.value} value={s.value} className="bg-[#120a04] text-amber-100">
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="text-red-400 text-xs mt-1">{errors.state.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  {...register("isDefault")}
                  className="h-4 w-4 rounded border-amber-500/30 bg-[#120a04] text-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                />
                <Label htmlFor="isDefault" className="text-amber-100 cursor-pointer">
                  Definir como endereço padrão
                </Label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold"
                >
                  {submitting ? (
                    "Salvando..."
                  ) : editingId ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Atualizar Endereço
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Cadastrar Endereço
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancelForm}
                  className="text-amber-100/60 hover:text-amber-100 hover:bg-amber-500/10"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {!showForm && addresses.length === 0 && (
          <div className="text-center py-16">
            <MapPin className="h-16 w-16 text-amber-500/10 mx-auto mb-4" />
            <p className="text-amber-100/50 text-lg mb-2">
              Nenhum endereço cadastrado
            </p>
            <p className="text-amber-100/30 text-sm mb-6">
              Cadastre seus endereços de entrega para agilizar futuras compras.
            </p>
            <Button
              onClick={handleNewAddress}
              className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Primeiro Endereço
            </Button>
          </div>
        )}

        {!showForm && addresses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={cn(
                  "p-5 rounded-xl border transition-all group",
                  address.isDefault
                    ? "border-amber-400/40 bg-[#1a0f07]"
                    : "border-amber-500/20 bg-[#1a0f07] hover:border-amber-500/40"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="text-amber-100 font-medium truncate">
                      {address.recipientName}
                    </span>
                  </div>
                  {address.isDefault && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 shrink-0">
                      Padrão
                    </Badge>
                  )}
                </div>

                <div className="space-y-1.5 text-sm text-amber-100/60 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-amber-100/30 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">
                      {address.street}, {address.number}
                      {address.complement ? ` — ${address.complement}` : ""}
                      <br />
                      {address.neighborhood} — {address.city}/{address.state}
                      <br />
                      CEP: {address.zipCode}
                    </span>
                  </div>
                  {address.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-amber-100/30 shrink-0" />
                      <span>{address.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(address)}
                    className="text-amber-100/60 hover:text-amber-100 hover:bg-amber-500/10 h-8 px-3"
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId === address.id}
                    className="text-red-400/60 hover:text-red-400 hover:bg-red-400/10 h-8 px-3"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    {deletingId === address.id ? "Excluindo..." : "Excluir"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
