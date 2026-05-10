"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAgeStore } from "@/store/ageStore";
import { Button } from "@/components/ui/button";

export function AgeVerificationModal() {
  const { isVerified, verify } = useAgeStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isVerified) return null;

  const handleConfirm = () => {
    setLoading(true);
    verify();
  };

  const handleDeny = () => {
    router.push("/verificar-idade");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md mx-4 bg-[#1a0f07] border border-amber-800/50 rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="p-8 sm:p-10 flex flex-col items-center text-center">
            <div className="mb-6">
              <span className="font-display text-3xl tracking-[0.2em] text-amber-400">
                STILLARE
              </span>
            </div>

            <h1 className="font-display text-xl sm:text-2xl text-amber-100 mb-3">
              Você tem 18 anos ou mais?
            </h1>

            <p className="text-amber-100/50 text-sm leading-relaxed mb-8 max-w-xs">
              Este site vende bebidas alcoólicas. Confirme sua maioridade para continuar.
            </p>

            <div className="flex flex-col w-full gap-3">
              <Button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold h-12 text-base"
              >
                {loading ? "Confirmando..." : "Sim, tenho 18 anos ou mais"}
              </Button>

              <Button
                onClick={handleDeny}
                variant="outline"
                className="w-full border-amber-500/30 text-amber-100/70 hover:bg-amber-500/5 hover:text-amber-300 h-12 text-base"
              >
                Não
              </Button>
            </div>

            <p className="text-amber-100/30 text-[10px] leading-relaxed mt-6">
              Ao confirmar, você declara ser maior de 18 anos conforme a Lei 9.294/1996
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
