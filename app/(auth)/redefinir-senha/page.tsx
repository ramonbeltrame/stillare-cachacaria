"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Deve conter letras maiúsculas, minúsculas e números"
      ),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const handleSubmit = async (data: ResetFormData) => {
    if (!token) {
      setError("Token de redefinição não encontrado.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.message || "Token inválido ou expirado. Solicite um novo link."
        );
      }

      toast.success("Senha redefinida! Redirecionando...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-400 mb-4">
          Token de redefinição não encontrado. O link pode estar incorreto ou
          expirado.
        </p>
        <Link
          href="/esqueci-senha"
          className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
        >
          Solicitar novo link
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div>
          <Label className="text-amber-100">Nova Senha</Label>
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
          <Label className="text-amber-100">Confirmar Nova Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-100/30" />
            <Input
              {...form.register("confirmPassword")}
              type={showConfirm ? "text" : "password"}
              placeholder="Repita a nova senha"
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

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold h-12"
        >
          {loading ? "Redefinindo..." : "Redefinir Senha"}
        </Button>
      </form>
    </>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <div
      className="min-h-[90vh] flex items-center justify-center"
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
            Redefinir Senha
          </h1>
          <p className="text-amber-100/40 font-light text-sm">
            Escolha uma nova senha para sua conta
          </p>
        </div>

        <div
          className="p-6 rounded-xl border border-amber-500/20"
          style={{ backgroundColor: "#1a0f07" }}
        >
          <Suspense
            fallback={
              <div className="space-y-4 animate-pulse">
                <div className="h-10 rounded bg-amber-500/5" />
                <div className="h-10 rounded bg-amber-500/5" />
                <div className="h-12 rounded bg-amber-500/5" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-amber-100/40 hover:text-amber-300 text-sm transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
