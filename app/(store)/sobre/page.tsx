"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const woodTypes = [
  {
    name: "Carvalho Europeu",
    description:
      "Conferindo notas de baunilha, especiarias e um toque seco elegante. O carvalho europeu é reconhecido por sua densidade e por liberar taninos mais suaves, resultando em uma cachaça refinada e complexa.",
    color: "from-amber-500/20 to-amber-700/10",
  },
  {
    name: "Amburana",
    description:
      "A madeira brasileira por excelência. Confere aromas adocicados que remetem a cumaru, canela e mel, com um final aveludado que conquista até os paladares mais exigentes.",
    color: "from-orange-500/20 to-red-700/10",
  },
  {
    name: "Carvalho Americano Ex-Bourbon",
    description:
      "Barris que já abrigaram bourbon americano, trazendo notas de coco, caramelo e um leve toque defumado. Uma experiência única que une tradição mineira e influência internacional.",
    color: "from-emerald-500/20 to-amber-700/10",
  },
];

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: "#120a04" }}>
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <Image
          src="/images/about/about-historia.jpeg"
          alt="Stillare - Produção"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0f07]/80 via-[#1a0f07]/60 to-[#1a0f07]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08),transparent_70%)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-6xl text-amber-100 mb-4 leading-tight"
          >
            Onde o tempo
            <br />
            transforma sabor em arte
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-amber-100/50 text-lg font-light max-w-2xl mx-auto"
          >
            A história da Stillare é sobre paciência, precisão e paixão pela
            cachaça artesanal brasileira.
          </motion.p>
        </div>
      </section>

      {/* Story: Origin */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-3xl md:text-4xl text-amber-100 mb-6">
                Origem
              </h2>
              <div className="space-y-4 text-amber-100/60 font-light leading-relaxed">
                <p>
                  A Stillare nasceu da inquietude de Diego Henrique Batista,
                  engenheiro formado pela Universidade de São Paulo (USP), que
                  decidiu trocar a frieza das planilhas pelo calor dos
                  alambiques. Em Charqueada, interior de São Paulo, ele
                  encontrou o lugar perfeito para dar vida ao seu sonho.
                </p>
                <p>
                  Com a bagagem técnica de um engenheiro e o coração de um
                  artesão, Diego mergulhou no universo da cachaça. Estudou
                  processos de fermentação, destilação e envelhecimento com a
                  mesma disciplina que aplicava em seus projetos de engenharia.
                  Mas foi a sensibilidade adquirida ao longo de incontáveis
                  degustações que transformou a Stillare no que é hoje.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/3] rounded-xl overflow-hidden border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-5xl md:text-7xl text-amber-400/10 tracking-widest select-none">
                  STILLARE
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story: Process */}
      <section
        className="py-20"
        style={{ backgroundColor: "#1a0f07" }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1 relative aspect-[4/3] rounded-xl overflow-hidden border border-amber-500/20 bg-gradient-to-bl from-amber-500/10 to-transparent"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-5xl md:text-7xl text-amber-400/10 tracking-widest select-none">
                  ARTESANAL
                </span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <h2 className="font-display text-3xl md:text-4xl text-amber-100 mb-6">
                Processo
              </h2>
              <div className="space-y-4 text-amber-100/60 font-light leading-relaxed">
                <p>
                  Cada lote da Stillare é produzido em pequena escala. Utilizamos
                  apenas o coração do destilado — a porção mais nobre, livre de
                  cabeça e cauda — garantindo pureza e suavidade excepcionais.
                </p>
                <p>
                  A cana-de-açúcar é cuidadosamente selecionada de produtores
                  locais da região de Charqueada e Piracicaba. A fermentação é
                  natural, sem aditivos químicos ou aromatizantes artificiais.
                  O resultado é uma cachaça genuína, que preserva as
                  características originais da matéria-prima.
                </p>
                <p>
                  O envelhecimento acontece com paciência em barris selecionados,
                  onde a madeira e o destilado dialogam por meses ou anos,
                  criando camadas de sabor que só o tempo pode proporcionar.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Wood Types */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl text-amber-100 mb-3">
              Madeiras de Envelhecimento
            </h2>
            <p className="text-amber-100/40 font-light max-w-lg mx-auto">
              A escolha da madeira define a alma de cada cachaça
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {woodTypes.map((wood) => (
              <motion.div
                key={wood.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-6 rounded-xl border border-amber-500/20 bg-[#1a0f07] hover:border-amber-500/40 transition-all"
              >
                <div
                  className={`h-32 rounded-lg bg-gradient-to-br ${wood.color} mb-5 flex items-center justify-center`}
                >
                  <span className="font-display text-lg text-amber-400/60">
                    {wood.name}
                  </span>
                </div>
                <h3 className="font-display text-xl text-amber-200 mb-3">
                  {wood.name}
                </h3>
                <p className="text-amber-100/50 text-sm font-light leading-relaxed">
                  {wood.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section
        className="py-20"
        style={{ backgroundColor: "#1a0f07" }}
      >
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-4xl text-amber-100 mb-6">
              Nossa Filosofia
            </h2>
            <blockquote className="text-amber-100/60 text-lg font-light italic leading-relaxed mb-6">
              &ldquo;A cachaça é a expressão mais pura da cultura brasileira.
              Cada gole conta uma história de terra, de gente e de tradição.
              Nosso compromisso é honrar essa herança com excelência e
              respeito.&rdquo;
            </blockquote>
            <cite className="text-amber-400 font-display text-lg not-italic">
              Diego Henrique Batista
            </cite>
            <p className="text-amber-100/40 text-sm mt-2 font-light">
              Fundador — Engenheiro pela USP
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact info */}
      <section className="py-16 border-t border-amber-500/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
                <Mail className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="font-display text-sm uppercase tracking-wider text-amber-300">
                E-mail
              </h3>
              <a
                href="mailto:cachacastillare@gmail.com"
                className="text-amber-100/50 hover:text-amber-300 transition-colors text-sm"
              >
                cachacastillare@gmail.com
              </a>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
                <Phone className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="font-display text-sm uppercase tracking-wider text-amber-300">
                Telefone
              </h3>
              <a
                href="https://wa.me/5519999163024"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-100/50 hover:text-amber-300 transition-colors text-sm"
              >
                (19) 99916-3024
              </a>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
                <Instagram className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="font-display text-sm uppercase tracking-wider text-amber-300">
                Instagram
              </h3>
              <a
                href="https://www.instagram.com/cachacastillare"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-100/50 hover:text-amber-300 transition-colors text-sm"
              >
                @cachacastillare
              </a>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/contato">
              <Button
                variant="outline"
                className="border-amber-500/30 text-amber-100 hover:bg-amber-500/10 hover:text-amber-300"
              >
                Fale Conosco
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
