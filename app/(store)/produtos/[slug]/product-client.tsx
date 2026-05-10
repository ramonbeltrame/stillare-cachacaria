"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingCart, Truck, ChevronRight, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/store/ProductCard";
import { WishlistButton } from "@/components/store/WishlistButton";
import { ReviewSection } from "@/components/store/ReviewSection";
import { useCartStore, type CartProduct } from "@/store/cartStore";
import { formatCurrency, maskCep } from "@/lib/utils";

interface ProductImage {
  id: string;
  imageUrl: string;
  altText?: string | null;
  isPrimary: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string | null;
  longDescription?: string | null;
  price: number;
  stock: number;
  volumeMl?: number | null;
  alcoholPercentage?: number | null;
  weightGrams?: number | null;
  images: ProductImage[];
  category: { name: string; slug: string } | null;
}

interface ShippingOption {
  code: string;
  name: string;
  deliveryDays: number;
  price: number;
}

export function ProductDetailClient() {
  const params = useParams();
  const slug = params.slug as string;
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>("descricao");
  const [shippingCep, setShippingCep] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingCalculated, setShippingCalculated] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setProduct(data.product || data);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchProduct();
  }, [slug]);

  useEffect(() => {
    async function fetchRelated() {
      if (!product) return;
      try {
        const res = await fetch(`/api/products?category=${product.category?.slug || ""}&limit=4`);
        if (res.ok) {
          const data = await res.json();
          setRelatedProducts(Array.isArray(data) ? data : data.products || []);
        }
      } catch {}
    }
    fetchRelated();
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    const cartProduct: CartProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.images?.[0]?.imageUrl || null,
      volumeMl: product.volumeMl || null,
      stock: product.stock,
    };
    for (let i = 0; i < quantity; i++) addItem(cartProduct);
  };

  const handleShippingCalculate = async () => {
    if (!shippingCep || !product) return;
    const cleanCep = shippingCep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;
    setShippingLoading(true);
    try {
      const res = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zipCode: cleanCep,
          items: [{ weightGrams: product.weightGrams || 1000, quantity }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setShippingOptions(data.shippingOptions || data.options || []);
        setShippingCalculated(true);
      }
    } catch {} finally {
      setShippingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#120a04" }}>
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-80 w-80 rounded-lg bg-amber-500/5 mx-auto" />
          <div className="h-6 w-48 rounded bg-amber-500/5 mx-auto" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "#120a04" }}>
        <h1 className="font-display text-3xl text-amber-100 mb-4">Produto não encontrado</h1>
        <Link href="/produtos"><Button className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold">Ver Produtos</Button></Link>
      </div>
    );
  }

  const isSoldOut = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const primaryImage = product.images?.[selectedImage]?.imageUrl || null;
  const accordionSections = [
    { key: "descricao", label: "Descrição Completa" },
    { key: "informacoes", label: "Informações do Produto" },
    { key: "frete", label: "Frete e Entrega" },
    { key: "legal", label: "Aviso Legal" },
  ];

  return (
    <div style={{ backgroundColor: "#120a04" }}>
      <div className="container mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-amber-100/40 mb-8 flex-wrap">
          <Link href="/" className="hover:text-amber-300 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/produtos" className="hover:text-amber-300 transition-colors">Produtos</Link>
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link href={`/produtos?categoria=${product.category.slug}`} className="hover:text-amber-300 transition-colors">{product.category.name}</Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-amber-100/60">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square rounded-xl overflow-hidden border border-amber-500/20 bg-[#1a0f07] cursor-zoom-in group" onClick={() => setZoomedImage(primaryImage)}>
              {primaryImage ? (
                <Image src={primaryImage} alt={product.images?.[selectedImage]?.altText || product.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-6 transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="flex items-center justify-center h-full text-amber-500/20">Sem imagem</div>
              )}
              {isSoldOut && <Badge className="absolute top-4 left-4 bg-red-500/90 text-white z-10">Esgotado</Badge>}
              {isLowStock && <Badge className="absolute top-4 left-4 bg-orange-500/90 text-white z-10">Apenas {product.stock} un.</Badge>}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button key={img.id} onClick={() => setSelectedImage(i)} className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${i === selectedImage ? "border-amber-400" : "border-amber-500/20 hover:border-amber-500/50"}`}>
                    <Image src={img.imageUrl} alt={img.altText || `${product.name} ${i + 1}`} fill sizes="80px" className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="font-display text-3xl md:text-4xl text-amber-100 leading-tight mb-3">{product.name}</h1>
                <WishlistButton productId={product.id} variant="icon" iconClassName="h-6 w-6" className="mt-1.5 shrink-0" />
              </div>
              <div className="flex items-center gap-3 text-sm text-amber-100/50">
                {product.volumeMl && <span>{product.volumeMl}ml</span>}
                {product.volumeMl && product.alcoholPercentage && <span className="w-1 h-1 rounded-full bg-amber-500/40" />}
                {product.alcoholPercentage && <span>{product.alcoholPercentage}% vol.</span>}
                <span className="w-1 h-1 rounded-full bg-amber-500/40" />
                <span className={isSoldOut ? "text-red-400" : isLowStock ? "text-orange-400" : "text-green-400"}>
                  {isSoldOut ? "Esgotado" : isLowStock ? `Apenas ${product.stock} em estoque` : `Em estoque (${product.stock})`}
                </span>
              </div>
            </div>

            <div className="text-4xl font-display font-bold text-amber-400">{formatCurrency(product.price)}</div>
            <p className="text-amber-100/60 font-light leading-relaxed">{product.description || "Cachaça artesanal premium da Stillare."}</p>

            <div className="flex items-center gap-4">
              <span className="text-amber-100/60 text-sm">Quantidade:</span>
              <div className="flex items-center border border-amber-500/30 rounded-md">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="p-2.5 text-amber-100/70 hover:text-amber-300 transition-colors disabled:opacity-30"><Minus className="h-4 w-4" /></button>
                <span className="w-12 text-center text-amber-100 font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock} className="p-2.5 text-amber-100/70 hover:text-amber-300 transition-colors disabled:opacity-30"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            <Button onClick={handleAddToCart} disabled={isSoldOut} className="w-full h-14 text-lg bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold">
              <ShoppingCart className="mr-2 h-5 w-5" />
              {isSoldOut ? "Produto Esgotado" : "Adicionar ao Carrinho"}
            </Button>

            <div className="mt-8 border-t border-amber-500/20 pt-6 space-y-2">
              {accordionSections.map((section) => (
                <div key={section.key}>
                  <button onClick={() => setOpenAccordion(openAccordion === section.key ? null : section.key)} className="w-full flex items-center justify-between py-3 text-left">
                    <span className="font-display text-sm tracking-wider uppercase text-amber-300">{section.label}</span>
                    <span className="text-amber-100/30 text-lg">{openAccordion === section.key ? "−" : "+"}</span>
                  </button>
                  {openAccordion === section.key && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="pb-4 text-amber-100/60 text-sm font-light leading-relaxed">
                      {section.key === "descricao" && <p>{product.longDescription || product.description || "Descrição completa em breve."}</p>}
                      {section.key === "informacoes" && (
                        <div className="space-y-2">
                          <p><strong className="text-amber-100/80">SKU:</strong> {product.sku}</p>
                          {product.volumeMl && <p><strong className="text-amber-100/80">Volume:</strong> {product.volumeMl}ml</p>}
                          {product.alcoholPercentage && <p><strong className="text-amber-100/80">Teor Alcoólico:</strong> {product.alcoholPercentage}%</p>}
                          <p><strong className="text-amber-100/80">Categoria:</strong> {product.category?.name || "—"}</p>
                        </div>
                      )}
                      {section.key === "frete" && (
                        <div>
                          <p className="mb-4">Calcule o prazo e valor do frete para seu CEP:</p>
                          <div className="flex gap-2 mb-4">
                            <Input type="text" placeholder="00000-000" value={shippingCep} onChange={(e) => setShippingCep(maskCep(e.target.value))} maxLength={9} className="bg-[#1a0f07] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500" />
                            <Button onClick={handleShippingCalculate} disabled={shippingCep.replace(/\D/g, "").length !== 8 || shippingLoading} variant="outline" className="border-amber-500/30 text-amber-100 hover:bg-amber-500/10 shrink-0">{shippingLoading ? "..." : "Calcular"}</Button>
                          </div>
                          {shippingCalculated && (shippingOptions.length > 0 ? (
                            <div className="space-y-3">{shippingOptions.map((opt) => (
                              <div key={opt.code} className="flex items-center justify-between p-3 rounded-md bg-amber-500/5 border border-amber-500/10">
                                <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-amber-400" /><span className="text-amber-100 font-medium">{opt.name}</span><span className="text-amber-100/40 text-xs">até {opt.deliveryDays} dias úteis</span></div>
                                <span className="text-amber-400 font-semibold">{opt.price === 0 ? "Grátis" : formatCurrency(opt.price)}</span>
                              </div>
                            ))}</div>
                          ) : <p className="text-amber-100/40">Frete não disponível para este CEP.</p>)}
                        </div>
                      )}
                      {section.key === "legal" && (
                        <div className="space-y-3">
                          <div className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" /><p>A venda de bebidas alcoólicas é proibida para menores de 18 anos (Lei 9.294/1996).</p></div>
                          <p>Ao comprar, você declara ser maior de 18 anos. Beba com moderação.</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                  <Separator className="bg-amber-500/10" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-16 border-t border-amber-500/20">
            <h2 className="font-display text-2xl md:text-3xl text-amber-100 mb-8">Você também pode gostar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((rp) => (
                <ProductCard key={rp.id} id={rp.id} name={rp.name} slug={rp.slug} price={rp.price} imageUrl={rp.images?.[0]?.imageUrl ?? null} volumeMl={rp.volumeMl ?? null} alcoholPercentage={rp.alcoholPercentage ?? null} stock={rp.stock} isFeatured={false} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-20 pt-16 border-t border-amber-500/20">
          <h2 className="font-display text-2xl md:text-3xl text-amber-100 mb-8">Avaliações</h2>
          <ReviewSection productId={product.id} />
        </section>
      </div>

      {zoomedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8" onClick={() => setZoomedImage(null)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white z-10" onClick={() => setZoomedImage(null)}><X className="h-8 w-8" /></button>
          <div className="relative w-full h-full max-w-4xl max-h-[80vh]"><Image src={zoomedImage} alt={product.name} fill sizes="80vw" className="object-contain" /></div>
        </div>
      )}
    </div>
  );
}
