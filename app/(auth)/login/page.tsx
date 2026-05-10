"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[90vh] flex items-center justify-center" style={{ backgroundColor: "#120a04" }}>
        <div className="font-display text-2xl text-amber-400">Carregando...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "E-mail ou senha inválidos"
            : result.error
        );
      } else if (result?.ok) {
        toast.success("Login realizado com sucesso!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

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
            Entrar
          </h1>
          <p className="text-amber-100/40 font-light text-sm">
            Acesse sua conta para continuar
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
              <div className="flex items-center justify-between mb-1">
                <Label className="text-amber-100">Senha</Label>
                <Link
                  href="/esqueci-senha"
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Esqueci minha senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-100/30" />
                <Input
                  {...form.register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
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
              {form.formState.errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold h-12"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-amber-100/40 text-sm">
              Não tem uma conta?{" "}
              <Link
                href="/cadastro"
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
