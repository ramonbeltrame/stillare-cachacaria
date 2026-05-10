"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(180deg, #120a04 0%, #1a0f07 50%, #120a04 100%)",
      }}
    >
      <div className="text-center max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-20 h-20 mx-auto mb-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"
          >
            <RefreshCw className="h-10 w-10 text-amber-400" />
          </motion.div>

          <h1 className="font-display text-3xl md:text-4xl text-amber-100 mb-3">
            Ops! Algo deu errado
          </h1>
          <p className="text-amber-100/50 font-light text-base leading-relaxed max-w-md mx-auto mb-8">
            Nossos alambiques estão em manutenção. Tente novamente em alguns
            instantes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={reset}
              className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold h-12 px-8 rounded-full group"
            >
              <RefreshCw className="mr-2 h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
              Tentar novamente
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                className="border-amber-500/30 text-amber-100 hover:bg-amber-500/10 hover:text-amber-300 h-12 px-8 rounded-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Voltar para Home
              </Button>
            </Link>
          </div>
        </motion.div>

        {error.digest && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-amber-100/20 text-xs font-mono"
          >
            ID: {error.digest}
          </motion.p>
        )}
      </div>
    </div>
  );
}
