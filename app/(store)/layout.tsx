import dynamic from "next/dynamic";
import { Footer } from "@/components/layout/Footer";
import { AgeVerificationModal } from "@/components/store/AgeVerificationModal";
import { ScrollToTop } from "@/components/store/ScrollToTop";

const Header = dynamic(() => import("@/components/layout/Header").then((m) => ({ default: m.Header })), {
  ssr: false,
  loading: () => (
    <header className="sticky top-0 z-50 h-16 flex items-center justify-center" style={{ backgroundColor: "#1a0f07" }}>
      <span className="font-display text-xl tracking-[0.3em] text-amber-400">STILLARE</span>
    </header>
  ),
});

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AgeVerificationModal />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
