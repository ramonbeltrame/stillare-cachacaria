import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Providers } from "./providers";
import Script from "next/script";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.stillare.com.br";
const siteName = "Stillare Cachaçaria";
const siteDescription =
  "Cachaça artesanal premium envelhecida em barris de Carvalho Europeu, Amburana e Ex-Bourbon. Produzida em Charqueada-SP. Compre online com entrega para todo Brasil.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: `%s | ${siteName}`,
    default: `${siteName} — Cachaça Artesanal Premium | Compre Online`,
  },
  description: siteDescription,
  keywords: [
    "cachaça artesanal", "cachaça premium", "comprar cachaça online",
    "cachaça envelhecida", "cachaça carvalho europeu", "cachaça amburana",
    "cachaça bourbon", "cachaça artesanal SP", "alambique cachaça",
    "destilaria cachaça", "cachaça de qualidade", "Stillare cachaça",
    "cachaça Piracicaba", "cachaça Charqueada", "cachaça jequitibá",
    "cachaça blend premium", "cachaça extra premium", "kit cachaça",
    "cachaça presente", "bebida artesanal brasileira",
  ],
  authors: [{ name: "Stillare Cachaçaria" }],
  creator: "Stillare Cachaçaria",
  publisher: "Stillare Cachaçaria",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName,
    title: `${siteName} — Cachaça Artesanal Premium`,
    description: siteDescription,
    url: siteUrl,
    images: [{ url: `${siteUrl}/images/hero/hero-bg.jpeg`, width: 1200, height: 630, alt: "Stillare Cachaçaria Artesanal" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@stillare",
    creator: "@stillare",
    title: `${siteName} — Cachaça Artesanal Premium`,
    description: siteDescription,
    images: [`${siteUrl}/images/hero/hero-bg.jpeg`],
  },
  alternates: { canonical: siteUrl },
  icons: { icon: "/favicon.ico" },
  verification: {
    google: "INSIRA_SEU_CODIGO_GOOGLE_SEARCH_CONSOLE",
  },
  category: "e-commerce",
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Stillare Cachaçaria",
  url: siteUrl,
  logo: `${siteUrl}/images/hero/hero-bg.jpeg`,
  description: siteDescription,
  email: "cachacastillare@gmail.com",
  telephone: "+5519999163024",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Charqueada",
    addressRegion: "SP",
    addressCountry: "BR",
  },
  sameAs: ["https://instagram.com/cachacastillare"],
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  description: siteDescription,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/produtos?busca={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const jsonLdLocalBusiness = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${siteUrl}#business`,
  name: "Stillare Comercio de Bebidas",
  image: `${siteUrl}/images/hero/hero-bg.jpeg`,
  url: siteUrl,
  telephone: "+5519999163024",
  email: "cachacastillare@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Estrada Municipal, 100",
    addressLocality: "Charqueada",
    addressRegion: "SP",
    postalCode: "13515-000",
    addressCountry: "BR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -22.509,
    longitude: -47.778,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "18:00",
  },
  priceRange: "R$29,90 - R$299,90",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="keywords" content="cachaça artesanal, cachaça premium, comprar cachaça online, cachaça envelhecida, cachaça carvalho europeu, cachaça amburana, cachaça bourbon, Stillare, cachaça SP, cachaça Charqueada, cachaça Piracicaba, destilaria, alambique, bebida artesanal, presente cachaça, kit degustação cachaça" />
        <meta name="author" content="Stillare Cachaçaria" />
        <meta name="theme-color" content="#1a0f07" />
        <meta name="apple-mobile-web-app-title" content="Stillare" />
        <link rel="canonical" href={siteUrl} />
        <link rel="manifest" href="/manifest.webmanifest" />
        <Script
          id="json-ld-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <Script
          id="json-ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <Script
          id="json-ld-localbusiness"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness) }}
        />
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js'); }`}
        </Script>
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
