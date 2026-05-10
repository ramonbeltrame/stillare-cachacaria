"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { User, Mail, Phone, CreditCard, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export default function MinhaContaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
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
    if (status === "authenticated") {
      fetchProfile();
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

  return (
    <div style={{ backgroundColor: "#120a04" }}>
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <h1 className="font-display text-3xl text-amber-100 mb-2">
          Minha Conta
        </h1>
        <p className="text-amber-100/40 font-light mb-10">
          Gerencie suas informações pessoais
        </p>

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
