"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Award,
  TrendingUp,
  Clock,
  Gift,
  ShoppingCart,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  Sparkles,
  Crown,
  Shield,
  Medal,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";

interface LoyaltyHistoryItem {
  id: string;
  points: number;
  type: "EARNED" | "REDEEMED" | "EXPIRED";
  description: string;
  createdAt: string;
}

interface NextTier {
  key: string;
  label: string;
  min: number;
  discount: number;
}

interface LoyaltyData {
  id: string;
  points: number;
  totalEarned: number;
  totalSpent: number;
  tier: string;
  tierLabel: string;
  tierDiscount: number;
  nextTier: NextTier | null;
  pointsToNextTier: number;
  nextPurchasePoints: number;
  history: LoyaltyHistoryItem[];
}

const TIER_ICONS: Record<string, React.ComponentType<any>> = {
  BRONZE: Medal,
  PRATA: Shield,
  OURO: Crown,
  DIAMANTE: Sparkles,
};

const TIER_COLORS: Record<string, string> = {
  BRONZE: "#cd7f32",
  PRATA: "#c0c0c0",
  OURO: "#d4a853",
  DIAMANTE: "#7ec8e3",
};

const TIER_BORDER: Record<string, string> = {
  BRONZE: "border-[#cd7f32]/30",
  PRATA: "border-[#c0c0c0]/30",
  OURO: "border-amber-500/50",
  DIAMANTE: "border-[#7ec8e3]/60",
};

export default function FidelidadePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState<number>(100);
  const [coupon, setCoupon] = useState<{ code: string; discountValue: number; discountLabel: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/fidelidade");
      return;
    }
    if (status === "loading") return;

    fetchLoyalty();
  }, [status, router]);

  const fetchLoyalty = async () => {
    try {
      const res = await fetch("/api/loyalty");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!data || redeemAmount <= 0 || redeemAmount > data.points) return;
    setRedeeming(true);
    try {
      const res = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: redeemAmount }),
      });
      if (res.ok) {
        const json = await res.json();
        setCoupon(json.coupon);
        toast.success("Pontos resgatados com sucesso!");
        fetchLoyalty();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao resgatar pontos");
      }
    } catch {
      toast.error("Erro ao resgatar pontos");
    } finally {
      setRedeeming(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center" style={{ backgroundColor: "#120a04" }}>
        <div className="animate-pulse space-y-4 w-full max-w-2xl px-4">
          <div className="h-8 w-48 rounded bg-amber-500/5 mx-auto" />
          <div className="h-40 rounded-xl bg-amber-500/5" />
          <div className="h-24 rounded-lg bg-amber-500/5" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center" style={{ backgroundColor: "#120a04" }}>
        <p className="text-amber-100/40">Erro ao carregar fidelidade.</p>
      </div>
    );
  }

  const TierIcon = TIER_ICONS[data.tier] || Medal;
  const tierColor = TIER_COLORS[data.tier] || "#d4a853";
  const tierBorder = TIER_BORDER[data.tier] || "border-amber-500/50";

  const progressPercent = data.nextTier
    ? Math.min(100, Math.round((data.points / data.nextTier.min) * 100))
    : 100;

  const redeemOptions = [
    { value: 50, label: "50 pts = R$ 2,50" },
    { value: 100, label: "100 pts = R$ 5,00" },
    { value: 200, label: "200 pts = R$ 10,00" },
    { value: 500, label: "500 pts = R$ 25,00" },
  ];

  return (
    <div style={{ backgroundColor: "#120a04" }}>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl text-amber-100 mb-2"
        >
          Programa de Fidelidade
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-amber-100/40 font-light mb-10"
        >
          Ganhe pontos em cada compra e troque por descontos
        </motion.p>

        {/* Tier Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`rounded-2xl border ${tierBorder} p-6 mb-8 relative overflow-hidden`}
          style={{ backgroundColor: "#1a0f07" }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10"
            style={{ backgroundColor: tierColor }} />
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TierIcon className="h-5 w-5" style={{ color: tierColor }} />
                <span className="font-display text-lg" style={{ color: tierColor }}>
                  {data.tierLabel}
                </span>
              </div>
              <p className="text-amber-100/40 text-sm">
                {data.tierDiscount > 0
                  ? `${data.tierDiscount}% de desconto na próxima compra`
                  : `Ganhe 1 ponto a cada R$ 10 em compras`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-display font-bold" style={{ color: tierColor }}>
                {data.points}
              </p>
              <p className="text-amber-100/30 text-xs">pontos</p>
            </div>
          </div>

          {data.nextTier && (
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-amber-100/40">{data.points} pts</span>
                <span className="text-amber-100/40">{data.nextTier.min} pts</span>
              </div>
              <div className="h-2 rounded-full bg-amber-500/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: tierColor }}
                />
              </div>
              <p className="text-amber-300/70 text-xs mt-1.5 text-center">
                Faltam {data.pointsToNextTier} pontos para {data.nextTier.label} ({data.nextTier.discount}% desc.)
              </p>
            </div>
          )}

          {!data.nextTier && (
            <div className="h-2 rounded-full bg-amber-500/10 overflow-hidden">
              <div className="h-full w-full rounded-full" style={{ backgroundColor: tierColor }} />
            </div>
          )}

          <p className="text-amber-400/80 text-sm mt-4 text-center font-medium">
            <ShoppingCart className="h-4 w-4 inline mr-1" />
            Ganhe {data.nextPurchasePoints} pontos na próxima compra
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="p-4 rounded-xl border border-amber-500/10 text-center" style={{ backgroundColor: "#1a0f07" }}>
            <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-amber-100">{data.totalEarned}</p>
            <p className="text-amber-100/30 text-xs">Total Ganho</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/10 text-center" style={{ backgroundColor: "#1a0f07" }}>
            <Gift className="h-5 w-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-amber-100">{data.points}</p>
            <p className="text-amber-100/30 text-xs">Disponíveis</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/10 text-center" style={{ backgroundColor: "#1a0f07" }}>
            <ArrowDown className="h-5 w-5 text-red-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-amber-100">{data.totalSpent}</p>
            <p className="text-amber-100/30 text-xs">Resgatados</p>
          </div>
        </motion.div>

        {/* Tiers Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <h2 className="font-display text-lg text-amber-100 mb-4">Benefícios por Nível</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { tier: "BRONZE", label: "Bronze", min: 0, discount: 0, color: "#cd7f32", desc: "1pt / R$10" },
              { tier: "PRATA", label: "Prata", min: 100, discount: 5, color: "#c0c0c0", desc: "5% desconto" },
              { tier: "OURO", label: "Ouro", min: 500, discount: 10, color: "#d4a853", desc: "10% desconto" },
              { tier: "DIAMANTE", label: "Diamante", min: 1000, discount: 15, color: "#7ec8e3", desc: "15% desconto" },
            ].map((t) => {
              const Icon = TIER_ICONS[t.tier] || Medal;
              return (
                <div
                  key={t.tier}
                  className={`p-3 rounded-lg border text-sm ${data.tier === t.tier ? "border-amber-500/40" : "border-amber-500/10"}`}
                  style={{ backgroundColor: data.tier === t.tier ? `${t.color}0d` : "#1a0f07" }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4" style={{ color: t.color }} />
                    <span className="font-medium" style={{ color: t.color }}>{t.label}</span>
                    {data.tier === t.tier && <span className="text-amber-400 text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded-full">ATUAL</span>}
                  </div>
                  <p className="text-amber-100/40 text-xs">{t.desc}</p>
                  <p className="text-amber-100/20 text-[10px] mt-0.5">{t.min}+ pontos</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Redeem */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl border border-amber-500/20 mb-8"
          style={{ backgroundColor: "#1a0f07" }}
        >
          <h2 className="font-display text-lg text-amber-100 mb-4 flex items-center gap-2">
            <Gift className="h-5 w-5 text-amber-400" />
            Resgatar Pontos
          </h2>
          <p className="text-amber-100/50 text-sm mb-4">
            Troque seus pontos por cupons de desconto. Cada 1 ponto = R$ 0,05 de desconto.
          </p>

          {coupon ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 rounded-lg border-2 border-dashed border-green-500/30 bg-green-500/5"
            >
              <p className="text-green-400 font-semibold text-center mb-2">Cupom gerado com sucesso!</p>
              <div className="text-center">
                <p className="text-2xl font-mono font-bold text-amber-300 tracking-wider">{coupon.code}</p>
                <p className="text-amber-100/60 text-sm mt-1">Desconto de {coupon.discountLabel}</p>
              </div>
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={() => navigator.clipboard.writeText(coupon.code)}
                  className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
                >
                  Copiar código
                </button>
                <Link
                  href="/carrinho"
                  className="text-amber-400 hover:text-amber-300 text-sm transition-colors flex items-center gap-1"
                >
                  Ir ao carrinho <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          ) : (
            <div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {redeemOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRedeemAmount(opt.value)}
                    disabled={opt.value > data.points}
                    className={`p-2 rounded-lg border text-center text-xs transition-all ${
                      redeemAmount === opt.value
                        ? "border-amber-400 bg-amber-500/10 text-amber-300"
                        : opt.value > data.points
                        ? "border-amber-500/10 text-amber-100/20 cursor-not-allowed"
                        : "border-amber-500/20 text-amber-100/50 hover:border-amber-500/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleRedeem}
                disabled={redeeming || data.points <= 0 || redeemAmount > data.points || redeemAmount <= 0}
                className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/20 disabled:text-amber-100/20 text-[#1a0f07] font-semibold transition-colors"
              >
                {redeeming ? "Resgatando..." : `Resgatar ${redeemAmount} Pontos`}
              </button>
            </div>
          )}
        </motion.div>

        {/* History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="font-display text-lg text-amber-100 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-400" />
            Histórico
          </h2>

          {data.history.length === 0 ? (
            <div className="p-8 rounded-xl border border-amber-500/10 text-center" style={{ backgroundColor: "#1a0f07" }}>
              <Award className="h-10 w-10 text-amber-500/10 mx-auto mb-2" />
              <p className="text-amber-100/40">Nenhuma movimentação ainda.</p>
              <p className="text-amber-100/20 text-sm mt-1">Seus pontos aparecerão aqui após as compras.</p>
              <Link
                href="/produtos"
                className="inline-block mt-4 text-amber-400 hover:text-amber-300 text-sm transition-colors"
              >
                Ir para a loja
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {data.history.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.02 * i }}
                  className="flex items-center gap-3 p-3 rounded-lg border border-amber-500/10"
                  style={{ backgroundColor: "#1a0f07" }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      item.type === "EARNED" ? "bg-green-500/10" : item.type === "REDEEMED" ? "bg-amber-500/10" : "bg-red-500/10"
                    }`}
                  >
                    {item.type === "EARNED" ? (
                      <ArrowUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-amber-100/70 text-sm truncate">{item.description}</p>
                    <p className="text-amber-100/20 text-xs">
                      {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span
                    className={`font-semibold text-sm shrink-0 ${
                      item.points > 0 ? "text-green-400" : "text-amber-400"
                    }`}
                  >
                    {item.points > 0 ? "+" : ""}{item.points}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Shortcuts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-wrap gap-3 justify-center"
        >
          <Link
            href="/meus-pedidos"
            className="px-4 py-2 rounded-lg border border-amber-500/20 text-amber-100/60 hover:border-amber-500/40 hover:text-amber-300 transition-all text-sm"
          >
            Meus Pedidos
          </Link>
          <Link
            href="/minha-conta"
            className="px-4 py-2 rounded-lg border border-amber-500/20 text-amber-100/60 hover:border-amber-500/40 hover:text-amber-300 transition-all text-sm"
          >
            Minha Conta
          </Link>
          <Link
            href="/produtos"
            className="px-4 py-2 rounded-lg bg-amber-500 text-[#1a0f07] font-semibold hover:bg-amber-400 transition-colors text-sm flex items-center gap-1"
          >
            <ShoppingCart className="h-4 w-4" />
            Comprar Agora
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
