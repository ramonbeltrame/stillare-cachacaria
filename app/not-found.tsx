"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";

export default function NotFound() {
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
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-display text-[140px] md:text-[180px] leading-none text-amber-500/20 select-none"
          >
            404
          </motion.h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="-mt-10 mb-6"
        >
          <h2 className="font-display text-3xl md:text-4xl text-amber-100 mb-3">
            Página não encontrada
          </h2>
          <p className="text-amber-100/50 font-light text-base leading-relaxed max-w-md mx-auto">
            A cachaça que você procura não está aqui, mas temos outras opções
            artesanais esperando por você.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/">
            <Button
              className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold h-12 px-8 rounded-full group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Voltar para Home
            </Button>
          </Link>
          <Link href="/produtos">
            <Button
              variant="outline"
              className="border-amber-500/30 text-amber-100 hover:bg-amber-500/10 hover:text-amber-300 h-12 px-8 rounded-full group"
            >
              <Package className="mr-2 h-4 w-4" />
              Ver Produtos
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/10 bg-amber-500/5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-100/40 text-sm font-light">
              Stillare Cachaçaria Artesanal
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
