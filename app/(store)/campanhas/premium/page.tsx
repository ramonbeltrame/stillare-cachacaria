"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Award, TreePine, Shield, Star, ArrowRight, Truck, Package, ChefHat } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  volumeMl?: number | null;
  alcoholPercentage?: number | null;
  images?: Array<{ imageUrl: string; altText?: string | null; isPrimary: boolean }>;
}

export default function CampanhaPremiumPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?categoria=cachaca-premium&limit=3&featured=true")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.products || [];
        setProducts(list.slice(0, 3));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const badges = [
    { icon: Award, label: "Premiada", desc: "Medalhas em concursos internacionais" },
    { icon: ChefHat, label: "Artesanal", desc: "Produção em alambique de cobre" },
    { icon: TreePine, label: "Envelhecida em Madeira Nobre", desc: "Carvalho, amburana e bálsamo" },
    { icon: Shield, label: "Qualidade Premium", desc: "Seleção rigorosa de ingredientes" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#120a04" }}>
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-[80vh] flex items-center justify-center px-4 py-20 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-[#120a04]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-400/3 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs mb-6"
          >
            <Award className="h-3.5 w-3.5" />
            Cachaça Premium Brasileira
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl text-amber-100 mb-6 leading-tight"
          >
            Descubra a excelência da
            <br />
            <span className="text-amber-400">cachaça premium brasileira</span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-amber-100/50 text-lg mb-10 max-w-2xl mx-auto"
          >
            Stillare representa o ápice da cachaça artesanal. Cada gota carrega tradição, paciência e a alma da madeira nobre brasileira.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/produtos?categoria=cachaca-premium"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-bold text-lg transition-colors"
            >
              Explorar Premium
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-sm"
          >
            <Truck className="h-4 w-4" />
            Frete grátis
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Products */}
      <section className="px-4 py-16 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl text-amber-100 text-center mb-4"
        >
          Seleção Premium
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-amber-100/40 text-center mb-12"
        >
          Nossas melhores safras, selecionadas a dedo
        </motion.p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-amber-500/5 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
              >
                <Link
                  href={`/produtos/${product.slug}`}
                  className="block group"
                >
                  <div className="rounded-2xl border border-amber-500/20 overflow-hidden hover:border-amber-500/40 transition-all"
                    style={{ backgroundColor: "#1a0f07" }}>
                    <div className="aspect-[4/5] bg-gradient-to-b from-amber-500/5 to-amber-900/10 flex items-center justify-center relative overflow-hidden">
                      {product.images?.[0]?.imageUrl ? (
                        <img
                          src={product.images[0].imageUrl}
                          alt={product.images[0].altText || product.name}
                          className="h-3/4 w-3/4 object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Package className="h-20 w-20 text-amber-400/20 group-hover:text-amber-400/40 transition-colors" />
                      )}
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500 text-[#1a0f07] text-xs font-bold">
                        Premium
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        {product.volumeMl && (
                          <span className="text-amber-100/30 text-xs bg-amber-500/5 px-2 py-0.5 rounded">
                            {product.volumeMl}ml
                          </span>
                        )}
                        {product.alcoholPercentage && (
                          <span className="text-amber-100/30 text-xs bg-amber-500/5 px-2 py-0.5 rounded">
                            {product.alcoholPercentage}%
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-xl text-amber-100 group-hover:text-amber-300 transition-colors mb-2">
                        {product.name}
                      </h3>
                      <p className="text-amber-100/40 text-sm line-clamp-2 mb-4">
                        {product.description || "Cachaça premium envelhecida em madeira nobre"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-amber-400">
                          R$ {Number(product.price).toFixed(2).replace(".", ",")}
                        </span>
                        <Star className="h-5 w-5 text-amber-400" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-amber-100/40 py-12">
            Nenhum produto premium em destaque no momento. Confira nossa coleção completa.
            <Link href="/produtos?categoria=cachaca-premium" className="block mt-4 text-amber-400 hover:text-amber-300 text-lg font-medium">
              Ver Coleção Premium
            </Link>
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section className="px-4 py-16 border-t border-amber-500/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
            >
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                <badge.icon className="h-7 w-7 text-amber-400" />
              </div>
              <p className="text-amber-100 text-sm font-medium">{badge.label}</p>
              <p className="text-amber-100/30 text-xs mt-1">{badge.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="px-4 py-16 text-center"
      >
        <div className="max-w-2xl mx-auto p-10 rounded-2xl border border-amber-500/20 relative overflow-hidden"
          style={{ backgroundColor: "#1a0f07" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5" />
          <div className="relative z-10">
            <Award className="h-12 w-12 text-amber-400 mx-auto mb-4" />
            <h2 className="font-display text-2xl text-amber-100 mb-4">
              Pronto para experimentar o extraordinário?
            </h2>
            <p className="text-amber-100/50 mb-8">
              Descubra por que a Stillare é referência em cachaça premium artesanal.
            </p>
            <Link
              href="/produtos?categoria=cachaca-premium"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-bold text-lg transition-colors"
            >
              Explorar Premium
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
