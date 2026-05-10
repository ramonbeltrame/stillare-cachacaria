import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "./product-client";
import Script from "next/script";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.stillare.com.br";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      select: {
        name: true,
        description: true,
        metaTitle: true,
        metaDescription: true,
        images: { take: 1, select: { imageUrl: true, altText: true } },
      },
    });

    if (!product) {
      return {
        title: "Produto não encontrado",
        robots: { index: false, follow: true },
      };
    }

    const title = product.metaTitle || `Comprar ${product.name} Online — Cachaça Artesanal Premium | Stillare`;
    const description = product.metaDescription || product.description ||
      `Compre ${product.name} online com entrega para todo Brasil. Cachaça artesanal premium envelhecida em barris selecionados. Stillare Cachaçaria — Charqueada/SP.`;
    const imageUrl = product.images[0]?.imageUrl ? `${siteUrl}${product.images[0].imageUrl}` : `${siteUrl}/images/hero/hero-bg.jpeg`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${siteUrl}/produtos/${params.slug}`,
        images: [{ url: imageUrl, width: 1200, height: 630, alt: product.name }],
        siteName: "Stillare Cachaçaria",
        locale: "pt_BR",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
      alternates: { canonical: `${siteUrl}/produtos/${params.slug}` },
    };
  } catch {
    return { title: "Produto | Stillare Cachaçaria" };
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: { images: { orderBy: { displayOrder: "asc" } }, category: true },
    });

    if (!product) return <ProductDetailClient />;

    const firstImage = product.images[0]?.imageUrl || "/images/hero/hero-bg.jpeg";

    const jsonLdProduct = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description || "",
      sku: product.sku,
      image: product.images.map((img) => `${siteUrl}${img.imageUrl}`),
      brand: { "@type": "Brand", name: "Stillare" },
      category: product.category?.name || "Cachaça",
      offers: {
        "@type": "Offer",
        url: `${siteUrl}/produtos/${product.slug}`,
        priceCurrency: "BRL",
        price: product.price,
        availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: {
          "@type": "Organization",
          name: "Stillare Cachaçaria",
        },
      },
      additionalProperty: [
        { "@type": "PropertyValue", name: "Volume", value: `${product.volumeMl || "—"}ml` },
        { "@type": "PropertyValue", name: "Teor Alcoólico", value: `${product.alcoholPercentage || "—"}%` },
      ],
    };

    const jsonLdBreadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Produtos", item: `${siteUrl}/produtos` },
        ...(product.category ? [{ "@type": "ListItem", position: 3, name: product.category.name, item: `${siteUrl}/produtos?categoria=${product.category.slug}` }] : []),
        { "@type": "ListItem", position: product.category ? 4 : 3, name: product.name, item: `${siteUrl}/produtos/${product.slug}` },
      ],
    };

    return (
      <>
        <Script
          id="json-ld-product"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
        />
        <Script
          id="json-ld-breadcrumb"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
        />
        <ProductDetailClient />
      </>
    );
  } catch {
    return <ProductDetailClient />;
  }
}
