"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      isAdmin: "true",
      redirect: false,
    });

    if (result?.error) {
      setError("Email ou senha inválidos");
    } else if (result?.ok) {
      toast.success("Login realizado!");
      router.push("/admin");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <span className="font-display text-2xl tracking-[0.2em] text-amber-400">
            STILLARE
          </span>
          <h1 className="text-zinc-400 text-sm mt-2 font-light">Painel Administrativo</h1>
        </div>

        <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-zinc-300">Email</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@stillare.com.br"
                  className="pl-10 bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-zinc-300">Senha</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold h-11"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-6">
          Acesso restrito a administradores
        </p>
      </div>
    </div>
  );
}
