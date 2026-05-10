"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, User, ChevronRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const breadcrumbMap: Record<string, string> = {
  admin: "Dashboard",
  produtos: "Produtos",
  pedidos: "Pedidos",
  clientes: "Clientes",
  "notas-fiscais": "Notas Fiscais",
  notas: "Notas Fiscais",
  relatorios: "Relatórios",
  configuracoes: "Configurações",
  novo: "Novo",
  editar: "Editar",
};

interface AdminHeaderProps {
  onMenuToggle?: () => void;
}

export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const segments = pathname.split("/").filter(Boolean).slice(1);
  const displayName =
    session?.user?.name || session?.user?.email?.split("@")[0] || "Admin";

  return (
    <header className="sticky top-0 z-40 bg-zinc-950 border-b border-amber-500/20">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden text-amber-100/70 hover:text-amber-300 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-display text-xl tracking-[0.15em] text-amber-400">
              STILLARE
            </span>
            <span className="text-xs tracking-widest uppercase text-amber-100/50 bg-amber-500/10 px-2 py-0.5 rounded">
              Admin
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-amber-100/70">
            <User className="h-4 w-4" />
            <span>{displayName}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="text-amber-100/60 hover:text-red-400 hover:bg-red-500/5"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Sair
          </Button>
        </div>
      </div>

      <div className="bg-zinc-900 border-b border-amber-500/10">
        <div className="px-6 py-2 flex items-center gap-1.5 text-xs text-amber-100/50">
          <Link href="/admin" className="hover:text-amber-300 transition-colors">
            Admin
          </Link>
          {segments.map((segment, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3" />
              <Link
                href={`/admin/${segments.slice(0, i + 1).join("/")}`}
                className={`${
                  i === segments.length - 1
                    ? "text-amber-400"
                    : "hover:text-amber-300"
                } transition-colors capitalize`}
              >
                {breadcrumbMap[segment] || segment}
              </Link>
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
