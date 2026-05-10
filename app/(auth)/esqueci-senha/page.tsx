"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Mail, Send, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const forgotSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function EsqueciSenhaPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = async (data: ForgotFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // Always show success, even if the email doesn't exist (security best practice)
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div
        className="min-h-[90vh] flex items-center justify-center"
        style={{ backgroundColor: "#120a04" }}
      >
        <div className="max-w-md w-full px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <Send className="h-8 w-8 text-green-400" />
          </div>
          <h1 className="font-display text-2xl text-amber-100 mb-4">
            E-mail enviado
          </h1>
          <p className="text-amber-100/60 font-light leading-relaxed mb-6">
            Se o e-mail informado existir em nossa base, enviaremos um link de
            redefinição de senha. Verifique sua caixa de entrada e a pasta de
            spam.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o login
          </Link>
        </div>
      </div>
    );
  }

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
            Esqueci minha senha
          </h1>
          <p className="text-amber-100/40 font-light text-sm">
            Informe seu e-mail para receber o link de redefinição
          </p>
        </div>

        <div
          className="p-6 rounded-xl border border-amber-500/20"
          style={{ backgroundColor: "#1a0f07" }}
        >
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold h-12"
            >
              {loading ? "Enviando..." : "Enviar link de redefinição"}
            </Button>
          </form>

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
