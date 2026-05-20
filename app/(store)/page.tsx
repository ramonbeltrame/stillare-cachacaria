"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Award,
  Factory,
  ChevronRight,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductSkeleton } from "@/components/store/ProductSkeleton";
import { formatCurrency } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  volumeMl?: number | null;
  alcoholContent?: number | null;
  stock: number;
  featured?: boolean;
}

const infoCards = [
  {
    icon: Factory,
    title: "Artesanal",
    description:
      "Produção limitada, corte coração do destilado, sem aditivos ou aromatizantes.",
  },
  {
    icon: Award,
    title: "Premiada",
    description:
      "Notas excepcionais em concursos nacionais e internacionais de destilados.",
  },
  {
    icon: Truck,
    title: "Entrega Nacional",
    description:
      "Enviamos com segurança para todos os estados do Brasil pelos Correios.",
  },
  {
    icon: ShieldCheck,
    title: "Pagamento Seguro",
    description:
      "Mercado Pago com criptografia SSL. Pague com cartão, PIX ou boleto.",
  },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<
    "idle" | "sending" | "sent"
  >("idle");

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products?featured=true"),
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(Array.isArray(catData) ? catData : catData.categories || []);
        }

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setFeaturedProducts(
            Array.isArray(prodData) ? prodData : prodData.products || []
          );
        }
      } catch {
        // Silently fail, fallback to empty arrays
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleNewsletter = useCallback(async () => {
    if (!email || newsletterStatus !== "idle") return;
    setNewsletterStatus("sending");
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setNewsletterStatus("sent");
      setEmail("");
    } catch {
      // Silently handle
    } finally {
      setNewsletterStatus("idle");
    }
  }, [email, newsletterStatus]);

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section
        className="relative flex items-center justify-center min-h-[85vh] overflow-hidden"
      >
        <Image
          src="/images/hero/hero-bg.jpeg"
          alt="Stillare Cachaçaria"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0f07]/90 via-[#1a0f07]/70 to-amber-900/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15),transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-amber-100 leading-tight mb-6">
              A Tradição em
              <br />
              Cada Gole
            </h1>
            <p className="text-amber-100/60 text-lg md:text-xl font-light max-w-xl mx-auto mb-10">
              Cachaça artesanal premium, envelhecida em barris de carvalho.
              Entregue em todo o Brasil.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/produtos">
                <Button className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold h-14 px-10 text-lg rounded-full">
                  Comprar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-5 py-3">
                <Truck className="h-4 w-4 text-amber-400" />
                <span className="text-amber-300 text-sm font-medium">
                  Frete grátis acima de R$ 200
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES GRID */}
      <section
        className="py-20"
        style={{ background: "linear-gradient(180deg, #120a04 0%, #1a0f07 100%)" }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl text-amber-100 mb-3">
              Nossas Categorias
            </h2>
            <p className="text-amber-100/40 font-light">
              Descubra a variedade de estilos de envelhecimento
            </p>
          </div>

          {loading ? (
            <ProductSkeleton count={3} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
          ) : categories.length === 0 ? (
            <div className="text-center text-amber-100/30 py-12">
              Nenhuma categoria disponível no momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/produtos?categoria=${cat.slug}`}
                  className="group relative h-48 rounded-lg overflow-hidden border border-amber-500/20 bg-[#120a04] hover:border-amber-500/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                >
                  <Image
                    src={`/images/categories/${cat.slug === "cachaca-classica" ? "classica" : cat.slug === "cachaca-premium" ? "premium" : cat.slug === "cachaca-envelhecida" ? "envelhecida" : "artesanal"}.jpeg`}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f07] via-[#1a0f07]/50 to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <h3 className="font-display text-2xl text-amber-300 mb-2 group-hover:text-amber-400 transition-colors">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-amber-100/50 text-sm font-light line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                    <span className="mt-3 flex items-center gap-1 text-amber-400 text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                      Ver Produtos <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featuredProducts.length > 0 && (
        <section className="py-20" style={{ backgroundColor: "#120a04" }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl text-amber-100 mb-3">
                Mais Vendidos
              </h2>
              <p className="text-amber-100/40 font-light">
                Os favoritos dos nossos clientes
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product: any) => {
                const img =
                  product.images?.find((i: any) => i.isPrimary)?.imageUrl ||
                  product.images?.[0]?.imageUrl ||
                  product.imageUrl ||
                  null;
                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    imageUrl={img}
                    volumeMl={product.volumeMl ?? null}
                    alcoholPercentage={product.alcoholPercentage ?? product.alcoholContent ?? null}
                    stock={product.stock}
                    isFeatured={product.isFeatured ?? product.featured ?? false}
                  />
                );
              })}
            </div>
            <div className="text-center mt-10">
              <Link href="/produtos">
                <Button
                  variant="outline"
                  className="border-amber-500/30 text-amber-100 hover:bg-amber-500/10 hover:text-amber-300 h-12 px-8"
                >
                  Ver Todos os Produtos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* INFO BANNER */}
      <section
        className="py-20"
        style={{ backgroundColor: "#1a0f07" }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl text-amber-100 mb-3">
              Por que escolher nossa cachaça?
            </h2>
            <p className="text-amber-100/40 font-light max-w-lg mx-auto">
              Cada garrafa carrega o cuidado de um processo artesanal que
              respeita o tempo e a tradição
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {infoCards.map((card) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center p-6 rounded-xl border border-amber-500/10 bg-[#120a04]/50 hover:border-amber-500/30 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                  <card.icon className="h-7 w-7 text-amber-400" />
                </div>
                <h3 className="font-display text-lg text-amber-100 mb-2">
                  {card.title}
                </h3>
                <p className="text-amber-100/50 text-sm font-light leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section
        className="py-20"
        style={{ background: "linear-gradient(180deg, #1a0f07 0%, #120a04 100%)" }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-3xl md:text-5xl text-amber-100 mb-6 leading-tight">
                Onde o tempo
                <br />
                transforma sabor
                <br />
                em arte
              </h2>
              <p className="text-amber-100/60 text-base font-light leading-relaxed mb-4">
                A Stillare nasceu em Charqueada, interior de São Paulo, da paixão
                de Diego Henrique Batista, engenheiro formado pela USP que trocou
                as planilhas pelos alambiques.
              </p>
              <p className="text-amber-100/50 text-sm font-light leading-relaxed mb-6">
                Cada gota de nossa cachaça carrega o respeito pela tradição mineira
                e a precisão da engenharia. Envelhecemos em barris de Carvalho
                Europeu, Amburana e Carvalho Americano Ex-Bourbon, criando perfis
                únicos de sabor que conquistam os paladares mais exigentes.
              </p>
              <Link href="/sobre">
                <Button
                  variant="outline"
                  className="border-amber-500/30 text-amber-100 hover:bg-amber-500/10 hover:text-amber-300 h-12 px-8"
                >
                  Conheça Nossa História
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/3] rounded-xl overflow-hidden border border-amber-500/20"
            >
              <Image
                src="/images/about/about-producao.jpeg"
                alt="Produção Stillare"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f07]/80 to-transparent" />
              <div className="absolute bottom-6 left-6 text-left">
                <span className="font-display text-4xl text-amber-400/80 tracking-widest">
                  STILLARE
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section
        className="py-20"
        style={{ backgroundColor: "#120a04" }}
      >
        <div className="container mx-auto px-4 max-w-lg text-center">
          <h2 className="font-display text-3xl text-amber-100 mb-3">
            Fique por dentro
          </h2>
          <p className="text-amber-100/50 font-light mb-8">
            Receba lançamentos, promoções e histórias do mundo da cachaça
            artesanal.
          </p>
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 bg-[#1a0f07] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500"
            />
            <Button
              onClick={handleNewsletter}
              disabled={!email || newsletterStatus === "sending"}
              className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold h-12 px-6"
            >
              {newsletterStatus === "sent" ? (
                "Inscrito!"
              ) : (
                <>
                  <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          <p className="text-amber-100/20 text-xs mt-4">
            Respeitamos sua privacidade. Cancele quando quiser.
          </p>
        </div>
      </section>
    </div>
  );
}
