"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, ShoppingCart, Wine, Star, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

const categorias = [
  { slug: "cachaca-classica", nome: "Clássica", desc: "Puras e equilibradas" },
  { slug: "cachaca-premium", nome: "Premium", desc: "Envelhecidas em madeiras nobres" },
  { slug: "cachaca-envelhecida", nome: "Envelhecida", desc: "Longa maturação" },
  { slug: "cachaca-artesanal", nome: "Artesanal", desc: "Produção limitada" },
];

const madeiras = ["Carvalho Europeu", "Carvalho Americano", "Amburana", "Jequitibá"];

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);
  const [madeiraAtiva, setMadeiraAtiva] = useState<string | null>(null);
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [ordenacao, setOrdenacao] = useState("relevancia");
  const addItem = useCartStore((s) => s.addItem);

  const fetchProdutos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("search", busca);
      if (categoriaAtiva) params.set("category", categoriaAtiva);
      if (madeiraAtiva) params.set("madeira", madeiraAtiva);
      params.set("limit", "50");
      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        let list = data.products || [];
        if (ordenacao === "menor-preco") list.sort((a: any, b: any) => a.price - b.price);
        if (ordenacao === "maior-preco") list.sort((a: any, b: any) => b.price - a.price);
        if (ordenacao === "nome") list.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setProdutos(list);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [busca, categoriaAtiva, madeiraAtiva, ordenacao]);

  useEffect(() => { fetchProdutos(); }, [fetchProdutos]);

  const handleAddCart = (p: any) => {
    addItem({
      id: p.id, name: p.name, slug: p.slug, price: p.price,
      imageUrl: p.images?.[0]?.imageUrl || null, volumeMl: p.volumeMl, stock: p.stock,
    });
    toast.success(`${p.name} adicionado`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0805] via-[#120a04] to-[#0d0805]">
      {/* Hero Banner */}
      <section className="relative overflow-hidden py-20 border-b border-amber-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,168,83,0.06),transparent_70%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-amber-500/3 rounded-full blur-[120px]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-amber-200/60 text-sm uppercase tracking-[0.4em] mb-4 font-medium"
          >
            Coleção Artesanal
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-7xl text-amber-100 mb-6 leading-tight"
          >
            Nossas <span className="text-amber-400">Cachaças</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-amber-100/40 text-lg max-w-xl mx-auto font-light"
          >
            Cada garrafa carrega o tempo, a madeira e a tradição de Charqueada
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Barra de ações */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
          {/* Categorias */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoriaAtiva(null)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                !categoriaAtiva
                  ? "bg-amber-500 text-[#1a0f07] shadow-lg shadow-amber-500/20"
                  : "bg-white/5 text-amber-100/60 hover:text-amber-100 hover:bg-white/10 border border-white/5"
              }`}
            >
              Todos
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setCategoriaAtiva(cat.slug)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  categoriaAtiva === cat.slug
                    ? "bg-amber-500 text-[#1a0f07] shadow-lg shadow-amber-500/20"
                    : "bg-white/5 text-amber-100/60 hover:text-amber-100 hover:bg-white/10 border border-white/5"
                }`}
              >
                {cat.nome}
              </button>
            ))}
          </div>

          {/* Busca + Ordenação */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-100/30" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar..."
                className="w-full h-11 pl-10 pr-4 rounded-full bg-white/5 border border-white/5 text-amber-100 text-sm placeholder:text-amber-100/20 focus:outline-none focus:border-amber-500/30 transition-colors"
              />
              {busca && (
                <button onClick={() => setBusca("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-100/30 hover:text-amber-100">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filtros mobile */}
            <button
              onClick={() => setFiltroAberto(!filtroAberto)}
              className="md:hidden h-11 px-4 rounded-full bg-white/5 border border-white/5 text-amber-100/60 text-sm flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Madeira
            </button>

            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
              className="h-11 px-4 rounded-full bg-white/5 border border-white/5 text-amber-100/60 text-sm focus:outline-none cursor-pointer"
            >
              <option value="relevancia">Relevância</option>
              <option value="menor-preco">Menor preço</option>
              <option value="maior-preco">Maior preço</option>
              <option value="nome">A-Z</option>
            </select>
          </div>
        </div>

        {/* Filtro de madeira (expand) */}
        <AnimatePresence>
          {filtroAberto && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="flex flex-wrap gap-2 pb-6 border-b border-white/5">
                <button
                  onClick={() => setMadeiraAtiva(null)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                    !madeiraAtiva ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-white/5 text-amber-100/40 border border-white/5"
                  }`}
                >
                  Todas as madeiras
                </button>
                {madeiras.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMadeiraAtiva(m)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                      madeiraAtiva === m ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-white/5 text-amber-100/40 border border-white/5"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid de produtos */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden animate-pulse">
                <div className="aspect-[4/5] bg-amber-500/5" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 bg-amber-500/5 rounded" />
                  <div className="h-3 w-1/2 bg-amber-500/5 rounded" />
                  <div className="h-6 w-1/3 bg-amber-500/5 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : produtos.length === 0 ? (
          <div className="text-center py-24">
            <Wine className="h-20 w-20 text-amber-500/10 mx-auto mb-6" />
            <h3 className="font-display text-2xl text-amber-100 mb-2">Nenhum produto encontrado</h3>
            <p className="text-amber-100/30 mb-6">Tente outros filtros ou termos de busca</p>
            <Button
              onClick={() => { setBusca(""); setCategoriaAtiva(null); setMadeiraAtiva(null); }}
              variant="outline"
              className="border-amber-500/30 text-amber-100 hover:bg-amber-500/10"
            >
              Limpar filtros
            </Button>
          </div>
        ) : (
          <>
            <p className="text-amber-100/20 text-sm mb-6">{produtos.length} produto{produtos.length !== 1 ? "s" : ""} encontrado{produtos.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {produtos.map((p, i) => {
                const img = p.images?.find((im: any) => im.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl || null;
                const esgotado = p.stock === 0;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="group relative bg-gradient-to-b from-white/[0.03] to-transparent rounded-2xl border border-white/5 overflow-hidden hover:border-amber-500/20 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1"
                  >
                    <Link href={`/produtos/${p.slug}`} className="block">
                      <div className="aspect-[4/5] relative overflow-hidden bg-gradient-to-b from-[#1a0f07] to-[#120a04]">
                        {img ? (
                          <Image
                            src={img}
                            alt={p.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-contain p-8 transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Wine className="h-16 w-16 text-amber-500/10" />
                          </div>
                        )}
                        {p.isFeatured && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500/90 text-[10px] font-bold text-[#1a0f07] uppercase tracking-wider">
                            Destaque
                          </span>
                        )}
                        {esgotado && (
                          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-red-500/90 text-[10px] font-bold text-white uppercase tracking-wider">
                            Esgotado
                          </span>
                        )}
                        {!esgotado && p.stock <= 5 && (
                          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-orange-500/20 text-[10px] font-medium text-orange-300 border border-orange-500/20">
                            {p.stock} un.
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <p className="text-xs text-amber-100/30 uppercase tracking-wider mb-1">
                          {p.volumeMl ? `${p.volumeMl}ml` : "Cachaça"} {p.alcoholPercentage ? `· ${p.alcoholPercentage}%` : ""}
                        </p>
                        <h3 className="font-display text-lg text-amber-100 mb-1 line-clamp-1 group-hover:text-amber-300 transition-colors">
                          {p.name}
                        </h3>
                        <p className="text-amber-100/30 text-xs line-clamp-2 mb-4 font-light leading-relaxed">
                          {p.description?.slice(0, 100) || "Cachaça artesanal premium"}
                        </p>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-display font-bold text-amber-400">
                              {formatCurrency(p.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="px-5 pb-5">
                      <Button
                        onClick={(e) => { e.preventDefault(); handleAddCart(p); }}
                        disabled={esgotado}
                        className={`w-full h-10 rounded-xl text-sm font-medium gap-2 transition-all ${
                          esgotado
                            ? "bg-white/5 text-amber-100/20 cursor-not-allowed"
                            : "bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500 hover:text-[#1a0f07] hover:border-amber-500"
                        }`}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {esgotado ? "Esgotado" : "Adicionar"}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
