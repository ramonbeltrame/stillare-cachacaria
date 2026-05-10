import Link from "next/link";
import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#1a0f07" }} className="border-t border-amber-900/30">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl tracking-[0.2em] text-amber-400">
                STILLARE
              </span>
            </Link>
            <p className="text-amber-100/60 text-sm leading-relaxed max-w-xs font-light">
              Onde o tempo transforma sabor em arte
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a
                href="https://www.instagram.com/cachacastillare"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full border border-amber-500/30 text-amber-100/70 hover:text-amber-300 hover:border-amber-400/50 transition-colors"
                aria-label="Instagram Stillare"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <span className="text-amber-100/40 text-xs">@cachacastillare</span>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm tracking-widest uppercase text-amber-400 mb-5">
              Links
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/produtos"
                  className="text-amber-100/60 hover:text-amber-300 text-sm transition-colors"
                >
                  Produtos
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-amber-100/60 hover:text-amber-300 text-sm transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre"
                  className="text-amber-100/60 hover:text-amber-300 text-sm transition-colors"
                >
                  Sobre
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="text-amber-100/60 hover:text-amber-300 text-sm transition-colors"
                >
                  Contato
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-de-privacidade"
                  className="text-amber-100/60 hover:text-amber-300 text-sm transition-colors"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/termos-de-uso"
                  className="text-amber-100/60 hover:text-amber-300 text-sm transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm tracking-widest uppercase text-amber-400 mb-5">
              Contato
            </h3>
            <div className="flex flex-col gap-3 text-sm text-amber-100/60">
              <a
                href="mailto:cachacastillare@gmail.com"
                className="text-amber-100/60 hover:text-amber-300 transition-colors"
              >
                cachacastillare@gmail.com
              </a>
              <a
                href="https://wa.me/5519999163024"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-100/60 hover:text-amber-300 transition-colors"
              >
                (19) 99916-3024
              </a>
              <p className="leading-relaxed">
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

      <div className="border-t border-amber-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-amber-100/40">
            <p>&copy; 2026 Stillare Cachaçaria. Todos os direitos reservados.</p>
            <p>🔞 Proibido para menores de 18 anos</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
