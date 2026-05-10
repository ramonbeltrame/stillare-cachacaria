"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, User, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const cadastroSchema = z
  .object({
    fullName: z.string().min(3, "Nome muito curto"),
    email: z.string().email("E-mail inválido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Deve conter letras maiúsculas, minúsculas e números"
      ),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
    phone: z.string().optional(),
    dateOfBirth: z.string().min(1, "Data de nascimento obrigatória"),
    cpf: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      const today = new Date();
      const birth = new Date(data.dateOfBirth);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age >= 18;
    },
    {
      message: "Você deve ter 18 anos ou mais para se cadastrar",
      path: ["dateOfBirth"],
    }
  );

type CadastroFormData = z.infer<typeof cadastroSchema>;

function maskPhone(value: string): string {
  value = value.replace(/\D/g, "");
  if (value.length === 11)
    return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
  if (value.length === 10)
    return `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
  return value;
}

function maskCpf(value: string): string {
  value = value.replace(/\D/g, "");
  if (value.length > 9)
    value =
      value.slice(0, 3) +
      "." +
      value.slice(3, 6) +
      "." +
      value.slice(6, 9) +
      "-" +
      value.slice(9, 11);
  else if (value.length > 6)
    value =
      value.slice(0, 3) + "." + value.slice(3, 6) + "." + value.slice(6);
  else if (value.length > 3) value = value.slice(0, 3) + "." + value.slice(3);
  return value;
}

export default function CadastroPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      dateOfBirth: "",
      cpf: "",
    },
  });

  const handleSubmit = async (data: CadastroFormData) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          phone: data.phone || undefined,
          dateOfBirth: data.dateOfBirth,
          cpf: data.cpf?.replace(/\D/g, "") || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Erro ao criar conta");
      }

      toast.success("Conta criada! Redirecionando...");

      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[90vh] flex items-center justify-center py-12"
      style={{ backgroundColor: "#120a04" }}
    >
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-display text-3xl tracking-[0.2em] text-amber-400">
              STILLARE
            </span>
          </Link>
          <h1 className="font-display text-2xl text-amber-100 mt-6 mb-1">
            Criar Conta
          </h1>
          <p className="text-amber-100/40 font-light text-sm">
            Junte-se à comunidade Stillare
          </p>
        </div>

        <div
          className="p-6 rounded-xl border border-amber-500/20"
          style={{ backgroundColor: "#1a0f07" }}
        >
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div>
              <Label className="text-amber-100">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-100/30" />
                <Input
                  {...form.register("fullName")}
                  placeholder="Seu nome completo"
                  className="pl-10 bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500"
                />
              </div>
              {form.formState.errors.fullName && (
                <p className="text-red-400 text-xs mt-1">
                  {form.formState.errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-amber-100">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-100/30" />
                <Input
                  {...form.register("email")}
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10 bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-red-400 text-xs mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-amber-100">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-100/30" />
                <Input
                  {...form.register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  className="pl-10 pr-10 bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-100/30 hover:text-amber-100/60 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-amber-100/30 text-xs mt-1">
                Deve conter letras maiúsculas, minúsculas e números
              </p>
              {form.formState.errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-amber-100">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-100/30" />
                <Input
                  {...form.register("confirmPassword")}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repita sua senha"
                  className="pl-10 pr-10 bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-100/30 hover:text-amber-100/60 transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-amber-100">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-100/30" />
                <Input
                  {...form.register("phone")}
                  placeholder="(00) 00000-0000"
                  onChange={(e) =>
                    form.setValue("phone", maskPhone(e.target.value))
                  }
                  className="pl-10 bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <Label className="text-amber-100">Data de Nascimento</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-100/30" />
                <Input
                  {...form.register("dateOfBirth")}
                  type="date"
                  className="pl-10 bg-[#120a04] border-amber-500/30 text-amber-100 focus-visible:ring-amber-500"
                />
              </div>
              {form.formState.errors.dateOfBirth && (
                <p className="text-red-400 text-xs mt-1">
                  {form.formState.errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-amber-100">
                CPF <span className="text-red-400">*</span>
              </Label>
              <Input
                {...form.register("cpf")}
                placeholder="000.000.000-00"
                onChange={(e) =>
                  form.setValue("cpf", maskCpf(e.target.value))
                }
                maxLength={14}
                className="bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500"
              />
              <p className="text-amber-100/30 text-xs mt-1">
                Obrigatório para emissão de nota fiscal e validação de identidade.
              </p>
              {form.formState.errors.cpf && (
                <p className="text-red-400 text-xs mt-1">
                  {form.formState.errors.cpf.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold h-12"
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-amber-100/40 text-sm">
              Já tem conta?{" "}
              <Link
                href="/login"
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
