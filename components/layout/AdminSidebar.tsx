"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  BarChart3,
  Settings,
  X,
  ExternalLink,
  Percent,
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/cupons", label: "Cupons", icon: Percent },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/imagens", label: "Imagens", icon: Image },
  { href: "/admin/notas-fiscais", label: "Notas Fiscais", icon: FileText },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-amber-500/20">
      <div className="flex items-center justify-between p-5 border-b border-amber-500/20">
        <Link
          href="/admin"
          className="font-display text-lg tracking-[0.15em] text-amber-400"
          onClick={onClose}
        >
          STILLARE
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden text-amber-100/70 hover:text-amber-300 transition-colors"
          aria-label="Fechar sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all group border-l-2",
                active
                  ? "bg-amber-500/10 text-amber-400 border-l-amber-400"
                  : "text-amber-100/60 hover:bg-amber-500/5 hover:text-amber-300 border-l-transparent"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active
                    ? "text-amber-400"
                    : "text-amber-100/40 group-hover:text-amber-300"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-amber-500/20 space-y-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-amber-100/50 hover:bg-amber-500/5 hover:text-amber-300 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Voltar ao Site
        </Link>
        <div className="text-[10px] text-amber-100/30 text-center tracking-wider uppercase">
          Stillare Admin v1.0
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 left-0 z-[90] h-full w-64 lg:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
