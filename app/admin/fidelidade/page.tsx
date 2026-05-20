"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Award, TrendingUp, Search, Filter, ChevronDown, Medal, Shield, Crown, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface LoyaltyCustomer {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  points: number;
  totalEarned: number;
  totalSpent: number;
  tier: string;
  createdAt: string;
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

export default function AdminFidelidadePage() {
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"points" | "name">("points");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/admin/loyalty");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const tiers = ["ALL", "BRONZE", "PRATA", "OURO", "DIAMANTE"];

  const filtered = customers
    .filter((c) => {
      if (filterTier !== "ALL" && c.tier !== filterTier) return false;
      if (search && !c.userName.toLowerCase().includes(search.toLowerCase()) && !c.userEmail.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const val = sortBy === "points" ? a.points - b.points : a.userName.localeCompare(b.userName);
      return sortDir === "desc" ? -val : val;
    });

  const stats = {
    total: customers.length,
    diamante: customers.filter((c) => c.tier === "DIAMANTE").length,
    ouro: customers.filter((c) => c.tier === "OURO").length,
    prata: customers.filter((c) => c.tier === "PRATA").length,
    bronze: customers.filter((c) => c.tier === "BRONZE").length,
    totalPoints: customers.reduce((s, c) => s + c.points, 0),
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-amber-500/5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-amber-500/5" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-amber-500/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl text-amber-100 mb-1 flex items-center gap-3">
          <Award className="h-6 w-6 text-amber-400" />
          Programa de Fidelidade
        </h1>
        <p className="text-amber-100/40 text-sm">Gerencie os pontos e níveis dos clientes</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3"
      >
        <div className="p-4 rounded-xl border border-amber-500/10 bg-zinc-800/50 text-center">
          <Users className="h-5 w-5 text-amber-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-amber-100">{stats.total}</p>
          <p className="text-amber-100/30 text-xs">Clientes</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/10 bg-zinc-800/50 text-center">
          <Sparkles className="h-5 w-5 text-[#7ec8e3] mx-auto mb-1" />
          <p className="text-xl font-bold text-[#7ec8e3]">{stats.diamante}</p>
          <p className="text-amber-100/30 text-xs">Diamante</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/10 bg-zinc-800/50 text-center">
          <Crown className="h-5 w-5 text-amber-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-amber-400">{stats.ouro}</p>
          <p className="text-amber-100/30 text-xs">Ouro</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/10 bg-zinc-800/50 text-center">
          <Shield className="h-5 w-5 text-[#c0c0c0] mx-auto mb-1" />
          <p className="text-xl font-bold text-[#c0c0c0]">{stats.prata}</p>
          <p className="text-amber-100/30 text-xs">Prata</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/10 bg-zinc-800/50 text-center">
          <Medal className="h-5 w-5 text-[#cd7f32] mx-auto mb-1" />
          <p className="text-xl font-bold text-[#cd7f32]">{stats.bronze}</p>
          <p className="text-amber-100/30 text-xs">Bronze</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/10 bg-zinc-800/50 text-center">
          <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-green-400">{stats.totalPoints}</p>
          <p className="text-amber-100/30 text-xs">Total Pts</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-100/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="pl-9 bg-zinc-800 border-amber-500/20 text-amber-100 placeholder:text-amber-100/30 h-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {tiers.map((t) => (
            <button
              key={t}
              onClick={() => setFilterTier(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterTier === t
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-zinc-800 text-amber-100/50 border border-amber-500/10 hover:bg-zinc-700"
              }`}
            >
              {t === "ALL" ? "Todos" : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setSortBy("points"); setSortDir((d) => d === "desc" ? "asc" : "desc"); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              sortBy === "points" ? "bg-amber-500/20 text-amber-400 border-amber-500/40" : "bg-zinc-800 text-amber-100/50 border-amber-500/10"
            }`}
          >
            Pontos {sortBy === "points" ? (sortDir === "desc" ? "↓" : "↑") : ""}
          </button>
          <button
            onClick={() => { setSortBy("name"); setSortDir((d) => d === "desc" ? "asc" : "desc"); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              sortBy === "name" ? "bg-amber-500/20 text-amber-400 border-amber-500/40" : "bg-zinc-800 text-amber-100/50 border-amber-500/10"
            }`}
          >
            Nome {sortBy === "name" ? (sortDir === "desc" ? "↓" : "↑") : ""}
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-amber-500/10 bg-zinc-800/50 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-amber-500/10">
                <th className="text-left px-4 py-3 text-amber-100/40 font-medium">Cliente</th>
                <th className="text-left px-4 py-3 text-amber-100/40 font-medium">Nível</th>
                <th className="text-right px-4 py-3 text-amber-100/40 font-medium">Pontos</th>
                <th className="text-right px-4 py-3 text-amber-100/40 font-medium hidden md:table-cell">Ganhos</th>
                <th className="text-right px-4 py-3 text-amber-100/40 font-medium hidden md:table-cell">Resgatados</th>
                <th className="text-right px-4 py-3 text-amber-100/40 font-medium hidden lg:table-cell">Entrou em</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer, i) => {
                const TierIcon = TIER_ICONS[customer.tier] || Medal;
                const color = TIER_COLORS[customer.tier] || "#d4a853";
                return (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.02 * i }}
                    className="border-b border-amber-500/5 hover:bg-amber-500/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-amber-100 font-medium">{customer.userName}</p>
                      <p className="text-amber-100/30 text-xs">{customer.userEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <TierIcon className="h-4 w-4" style={{ color }} />
                        <span style={{ color }} className="text-xs font-medium">
                          {customer.tier.charAt(0) + customer.tier.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-amber-300">{customer.points}</span>
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className="text-green-400">{customer.totalEarned}</span>
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className="text-amber-400">{customer.totalSpent}</span>
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell text-amber-100/30 text-xs">
                      {new Date(customer.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-amber-100/30">
            Nenhum cliente encontrado.
          </div>
        )}
      </motion.div>
    </div>
  );
}
