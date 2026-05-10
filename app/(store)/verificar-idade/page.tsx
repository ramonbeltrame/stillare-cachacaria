import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AgeVerificationDeniedPage() {
  return (
    <div
      className="min-h-[90vh] flex items-center justify-center"
      style={{ backgroundColor: "#120a04" }}
    >
      <div className="max-w-md mx-auto px-6 text-center">
        <div className="mb-8">
          <span className="font-display text-3xl tracking-[0.2em] text-amber-400/30">
            STILLARE
          </span>
        </div>

        <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-8">
          <AlertTriangle className="h-12 w-12 text-red-400" />
        </div>

        <div className="text-7xl font-display font-bold text-red-500/30 mb-6">
          18+
        </div>

        <h1 className="font-display text-3xl text-amber-100 mb-4">
          Acesso Negado
        </h1>

        <p className="text-amber-100/60 text-base font-light leading-relaxed mb-8">
          Este site vende bebidas alcoólicas e seu acesso é permitido apenas
          para maiores de 18 anos, conforme a Lei 9.294/1996.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="https://www.google.com">
            <button className="w-full h-12 bg-amber-500/10 border border-amber-500/30 text-amber-100 hover:bg-amber-500/20 transition-colors rounded-md font-medium">
              Voltar
            </button>
          </Link>

          <p className="text-amber-100/20 text-xs mt-4">
            Art. 243 do ECA — Lei 8.069/1990. Venda proibida para menores de 18
            anos. Aprenda mais em{" "}
            <a
              href="https://www.gov.br/obid"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-100/30 hover:text-amber-100/50 underline"
            >
              gov.br/obid
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
