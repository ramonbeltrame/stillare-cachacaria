"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Menu, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/produtos", label: "Produtos" },
  { href: "/blog", label: "Blog" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

import { CartIcon } from "@/components/store/CartIcon";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-shadow duration-300",
          scrolled ? "shadow-lg shadow-black/30" : ""
        )}
        style={{ backgroundColor: "#1a0f07" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="font-display text-xl tracking-[0.3em] text-amber-400">
                STILLARE
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm tracking-wider uppercase transition-colors duration-200",
                    pathname === link.href
                      ? "text-amber-400"
                      : "text-amber-100/70 hover:text-amber-300"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <Link
                href={mounted && session ? "/favoritos" : "/login"}
                className="text-amber-100/70 hover:text-amber-300 transition-colors"
                aria-label="Favoritos"
              >
                <Heart className="h-5 w-5" />
              </Link>
              <Link
                href={mounted && session ? "/minha-conta" : "/login"}
                className="text-amber-100/70 hover:text-amber-300 transition-colors"
                aria-label="Minha conta"
              >
                <User className="h-5 w-5" />
              </Link>

              <CartIcon />

              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden text-amber-100/70 hover:text-amber-300 transition-colors"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-amber-500/10 border-t border-amber-500/20">
          <div className="container mx-auto px-4 py-1.5 text-center text-sm text-amber-300/70 tracking-wide">
            🔞 Venda proibida para menores de 18 anos | Beba com moderação
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 right-0 z-[80] h-full w-72 flex flex-col shadow-2xl"
              style={{ backgroundColor: "#1a0f07" }}
            >
              <div className="flex items-center justify-between p-4 border-b border-amber-500/20">
                <span className="font-display text-lg tracking-wider text-amber-400">
                  STILLARE
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-amber-100/70 hover:text-amber-300 transition-colors"
                  aria-label="Fechar menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col p-4 gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-3 rounded-md text-sm tracking-wider uppercase transition-colors",
                      pathname === link.href
                        ? "bg-amber-500/10 text-amber-400"
                        : "text-amber-100/70 hover:bg-amber-500/5 hover:text-amber-300"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto p-4 border-t border-amber-500/20 space-y-1">
                <Link
                  href={mounted && session ? "/favoritos" : "/login"}
                  className="flex items-center gap-3 px-4 py-3 rounded-md text-sm text-amber-100/70 hover:bg-amber-500/5 hover:text-amber-300 transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  Favoritos
                </Link>
                <Link
                  href={mounted && session ? "/minha-conta" : "/login"}
                  className="flex items-center gap-3 px-4 py-3 rounded-md text-sm text-amber-100/70 hover:bg-amber-500/5 hover:text-amber-300 transition-colors"
                >
                  <User className="h-4 w-4" />
                  {mounted && session ? "Minha Conta" : "Entrar"}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
