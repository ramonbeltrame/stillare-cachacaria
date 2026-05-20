"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Gift, Package, Truck, Star, ChevronRight, Heart, ArrowRight } from "lucide-react";

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

export default function CampanhaPresentePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?categoria=cachaca-premium&limit=4")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.products || [];
        setProducts(list);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const kits = [
    { name: "Kit Degustação", description: "3 minigarfas + guia de degustação", price: 149.90, image: "/images/kit-degustacao.jpg", tag: "Mais vendido" },
    { name: "Bourbon Extra Premium", description: "Garrafa + 2 copos + embalagem presente", price: 249.90, image: "/images/kit-presente.jpg", tag: "Premium" },
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
        <div className="absolute top-20 left-10 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-600/3 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs mb-6"
          >
            <Gift className="h-3.5 w-3.5" />
            Embalagem premium para presente
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl text-amber-100 mb-6 leading-tight"
          >
            O presente perfeito para quem aprecia
            <br />
            <span className="text-amber-400">o melhor da cachaça artesanal</span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-amber-100/50 text-lg mb-10 max-w-2xl mx-auto"
          >
            Surpreenda com kits exclusivos e embalagens premium. Cada garrafa é uma experiência única envelhecida em madeira nobre.
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
              Comprar Presente
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
            Frete grátis para presentes acima de R$ 200
          </motion.div>
        </div>
      </motion.section>

      {/* Gift Kits */}
      <section className="px-4 py-16 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl text-amber-100 text-center mb-4"
        >
          Kits Presenteáveis
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-amber-100/40 text-center mb-12"
        >
          Selecionados para impressionar
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {kits.map((kit, i) => (
            <motion.div
              key={kit.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              className="group relative rounded-2xl border border-amber-500/20 overflow-hidden"
              style={{ backgroundColor: "#1a0f07" }}
            >
              {kit.tag && (
                <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-amber-500 text-[#1a0f07] text-xs font-bold">
                  {kit.tag}
                </div>
              )}
              <div className="aspect-[4/3] bg-gradient-to-br from-amber-500/10 to-amber-900/20 flex items-center justify-center">
                <Gift className="h-24 w-24 text-amber-400/30 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl text-amber-100 mb-2">{kit.name}</h3>
                <p className="text-amber-100/40 text-sm mb-4">{kit.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-amber-400">
                    R$ {kit.price.toFixed(2).replace(".", ",")}
                  </span>
                  <Link
                    href="/produtos?categoria=cachaca-premium"
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors text-sm font-medium"
                  >
                    Comprar <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="px-4 py-16 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl text-amber-100 text-center mb-12"
        >
          Também Recomendamos
        </motion.h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-amber-500/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i }}
              >
                <Link
                  href={`/produtos/${product.slug}`}
                  className="block p-4 rounded-xl border border-amber-500/10 hover:border-amber-500/30 transition-all group"
                  style={{ backgroundColor: "#1a0f07" }}
                >
                  <div className="aspect-square bg-gradient-to-br from-amber-500/5 to-amber-900/10 rounded-lg mb-3 flex items-center justify-center">
                    {product.images?.[0]?.imageUrl ? (
                      <img
                        src={product.images[0].imageUrl}
                        alt={product.images[0].altText || product.name}
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Package className="h-12 w-12 text-amber-400/20 group-hover:text-amber-400/40 transition-colors" />
                    )}
                  </div>
                  <h3 className="text-amber-100 text-sm font-medium truncate">{product.name}</h3>
                  <p className="text-amber-400 font-bold mt-1">
                    R$ {Number(product.price).toFixed(2).replace(".", ",")}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Trust Section */}
      <section className="px-4 py-16 border-t border-amber-500/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Gift, label: "Embalagem Premium", desc: "Pronta para presentear" },
            { icon: Truck, label: "Frete Grátis", desc: "Compras acima de R$200" },
            { icon: Star, label: "Produtos Premiados", desc: "Qualidade reconhecida" },
            { icon: Heart, label: "Feito com Alma", desc: "Produção artesanal" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                <item.icon className="h-6 w-6 text-amber-400" />
              </div>
              <p className="text-amber-100 text-sm font-medium">{item.label}</p>
              <p className="text-amber-100/30 text-xs mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
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
            <h2 className="font-display text-2xl text-amber-100 mb-4">
              Encontre o presente ideal
            </h2>
            <p className="text-amber-100/50 mb-8">
              Navegue por nossa coleção premium e surpreenda quem você ama.
            </p>
            <Link
              href="/produtos?categoria=cachaca-premium"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-bold text-lg transition-colors"
            >
              Explorar Coleção
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
