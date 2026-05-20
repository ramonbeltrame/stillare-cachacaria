"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Instagram, Heart, ShoppingCart, Shield, ArrowRight, ExternalLink, Camera, MessageCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  volumeMl?: number | null;
  images?: Array<{ imageUrl: string; altText?: string | null; isPrimary: boolean }>;
}

export default function CampanhaInstagramPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?limit=6")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.products || [];
        setProducts(list.slice(0, 6));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const galleryItems = [
    { icon: Camera, label: "Alambique", color: "amber" },
    { icon: Heart, label: "Degustação", color: "rose" },
    { icon: MessageCircle, label: "Harmonização", color: "amber" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#120a04" }}>
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-[60vh] flex items-center justify-center px-4 py-16 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 via-amber-500/3 to-[#120a04]" />
        <div className="absolute top-10 left-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-2xl text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-amber-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/20"
          >
            <Instagram className="h-10 w-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl text-amber-100 mb-4 leading-tight"
          >
            Stillare no Instagram
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-2xl sm:text-3xl font-display bg-gradient-to-r from-pink-400 to-amber-400 bg-clip-text text-transparent mb-4"
          >
            @cachacastillare
          </motion.p>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-amber-100/50 text-base mb-8 max-w-lg mx-auto"
          >
            Siga-nos para descobrir o universo da cachaça artesanal: bastidores, harmonizações e lançamentos exclusivos.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <a
              href="https://instagram.com/cachacastillare"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-sm transition-all hover:opacity-90"
            >
              <Instagram className="h-4 w-4" />
              Seguir no Instagram
              <ExternalLink className="h-3 w-3" />
            </a>
            <Link
              href="/produtos"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-bold text-sm transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              Comprar pelo Site
            </Link>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-xs"
          >
            <Shield className="h-3.5 w-3.5" />
            Compre pelo site com segurança
          </motion.div>
        </div>
      </motion.section>

      {/* Instagram Gallery */}
      <section className="px-4 py-12 max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl text-amber-100 text-center mb-8"
        >
          Galeria de Produtos
        </motion.h2>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square rounded-2xl bg-amber-500/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i }}
              >
                <Link
                  href={`/produtos/${product.slug}`}
                  className="block group relative aspect-square rounded-2xl overflow-hidden border border-amber-500/10 hover:border-amber-500/30 transition-all"
                  style={{ backgroundColor: "#1a0f07" }}
                >
                  {product.images?.[0]?.imageUrl ? (
                    <img
                      src={product.images[0].imageUrl}
                      alt={product.images[0].altText || product.name}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-amber-500/10 to-amber-900/20 flex items-center justify-center">
                      <Instagram className="h-8 w-8 text-amber-400/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div className="text-left">
                      <p className="text-white text-sm font-medium truncate">{product.name}</p>
                      <p className="text-amber-400 text-sm font-bold">
                        R$ {Number(product.price).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-bold transition-colors"
          >
            Ver Todos os Produtos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* Instagram Highlights */}
      <section className="px-4 py-12 border-t border-amber-500/10">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl text-amber-100 text-center mb-8"
          >
            Destaques do Instagram
          </motion.h2>

          <div className="grid grid-cols-3 gap-4">
            {galleryItems.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="text-center"
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 ${item.color === "rose" ? "border-pink-500/40" : "border-amber-500/40"} mx-auto mb-2 flex items-center justify-center bg-gradient-to-br from-amber-500/10 to-amber-900/20`}>
                  <item.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${item.color === "rose" ? "text-pink-400" : "text-amber-400"} opacity-60`} />
                </div>
                <p className="text-amber-100/40 text-xs">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="px-4 py-16 text-center"
      >
        <div className="max-w-lg mx-auto p-8 rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-amber-500/5 relative overflow-hidden">
          <div className="relative z-10">
            <Instagram className="h-10 w-10 text-pink-400 mx-auto mb-4" />
            <h2 className="font-display text-xl text-amber-100 mb-2">
              @cachacastillare
            </h2>
            <p className="text-amber-100/50 mb-6 text-sm">
              Siga nosso Instagram para conteúdo exclusivo, bastidores da produção e lançamentos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://instagram.com/cachacastillare"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-sm hover:opacity-90 transition-all"
              >
                <Instagram className="h-4 w-4" />
                Siga no Instagram
              </a>
              <Link
                href="/produtos"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-bold text-sm transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                Comprar Agora
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
