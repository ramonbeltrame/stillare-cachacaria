"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Send,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  subject: z.string().min(3, "Assunto obrigatório"),
  message: z.string().min(10, "Mensagem muito curta (mín. 10 caracteres)"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const handleSubmit = async (data: ContactFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
        form.reset();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Erro ao enviar mensagem");
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#120a04" }}>
      {/* Hero */}
      <section
        className="relative py-20 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1a0f07 0%, #2d1a0a 100%)",
        }}
      >
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-5xl text-amber-100 mb-4"
          >
            Fale Conosco
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-amber-100/50 text-lg font-light max-w-xl mx-auto"
          >
            Dúvidas, sugestões, parcerias ou apenas para dar um alô. Adoramos
            ouvir de você.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="p-8 rounded-xl border border-amber-500/20"
              style={{ backgroundColor: "#1a0f07" }}
            >
              <h2 className="font-display text-2xl text-amber-100 mb-2 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-amber-400" />
                Envie uma mensagem
              </h2>
              <p className="text-amber-100/40 text-sm mb-6 font-light">
                Respondemos em até 24 horas úteis.
              </p>

              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <div>
                  <Label className="text-amber-100">Nome</Label>
                  <Input
                    {...form.register("name")}
                    placeholder="Seu nome completo"
                    className="bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-400 text-xs mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-amber-100">E-mail</Label>
                  <Input
                    {...form.register("email")}
                    type="email"
                    placeholder="seu@email.com"
                    className="bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500"
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-400 text-xs mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-amber-100">Assunto</Label>
                  <Input
                    {...form.register("subject")}
                    placeholder="Como podemos ajudar?"
                    className="bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500"
                  />
                  {form.formState.errors.subject && (
                    <p className="text-red-400 text-xs mt-1">
                      {form.formState.errors.subject.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-amber-100">Mensagem</Label>
                  <Textarea
                    {...form.register("message")}
                    placeholder="Escreva sua mensagem aqui..."
                    rows={5}
                    className="bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500 resize-none"
                  />
                  {form.formState.errors.message && (
                    <p className="text-red-400 text-xs mt-1">
                      {form.formState.errors.message.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold h-12"
                >
                  {submitting ? (
                    "Enviando..."
                  ) : (
                    <>
                      Enviar Mensagem
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <div className="space-y-10">
              <div>
                <h2 className="font-display text-2xl text-amber-100 mb-6">
                  Informações de Contato
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-amber-200 font-medium text-sm mb-1">
                        E-mail
                      </h3>
                      <a
                        href="mailto:cachacastillare@gmail.com"
                        className="text-amber-100/50 hover:text-amber-300 transition-colors text-sm"
                      >
                        cachacastillare@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-amber-200 font-medium text-sm mb-1">
                        WhatsApp
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
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-amber-200 font-medium text-sm mb-1">
                        Localização
                      </h3>
                      <p className="text-amber-100/50 text-sm leading-relaxed">
                        Stillare Comércio de Bebidas
                        <br />
                        CNPJ em constituição
                        <br />
                        Charqueada - SP
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-amber-500/10 pt-8">
                <h3 className="text-amber-200 font-medium text-sm mb-4">
                  Redes Sociais
                </h3>
                <a
                  href="https://www.instagram.com/cachacastillare"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-500/30 text-amber-100/70 hover:text-amber-300 hover:border-amber-400/50 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                  @cachacastillare
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
