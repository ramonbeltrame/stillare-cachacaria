"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ImagePlus, Trash2, Star, StarOff, Upload, RefreshCw, ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";

interface ProductImageItem {
  id: string;
  imageUrl: string;
  altText: string | null;
  displayOrder: number;
  isPrimary: boolean;
}

interface ProductGroup {
  productId: string;
  productName: string;
  productSlug: string;
  images: ProductImageItem[];
}

interface StaticImage {
  filename: string;
  imageUrl: string;
}

interface ImagesData {
  products: ProductGroup[];
  hero: StaticImage[];
  about: StaticImage[];
  categories: StaticImage[];
}

export default function AdminImagesPage() {
  const [data, setData] = useState<ImagesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "hero" | "about" | "categories">("products");
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/images");
      if (res.ok) setData(await res.json());
    } catch (e) {
      toast.error("Erro ao carregar imagens");
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpload = async (productId?: string) => {
    const input = fileInputRef.current;
    if (!input?.files?.length) return;
    const file = input.files[0];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("section", activeTab === "products" ? "products" : activeTab);
    if (productId) formData.append("productId", productId);

    try {
      const res = await fetch("/api/admin/images", { method: "POST", body: formData });
      if (res.ok) {
        toast.success("Imagem enviada!");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao enviar");
      }
    } catch {
      toast.error("Erro ao enviar imagem");
    }
  };

  const handleDelete = async (imageId?: string, filename?: string) => {
    if (!confirm("Tem certeza que deseja remover esta imagem?")) return;

    const params = new URLSearchParams();
    if (imageId) params.set("id", imageId);
    if (filename) {
      params.set("filename", filename);
      params.set("section", activeTab);
    }

    try {
      const res = await fetch(`/api/admin/images?${params}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Imagem removida");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao remover");
      }
    } catch {
      toast.error("Erro ao remover imagem");
    }
  };

  const handleSetPrimary = async (imageId: string, productId: string) => {
    try {
      const res = await fetch("/api/admin/images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setPrimary", imageId, productId }),
      });
      if (res.ok) { toast.success("Foto principal alterada"); fetchData(); }
      else toast.error("Erro ao alterar");
    } catch { toast.error("Erro ao alterar"); }
  };

  const handleReplaceImage = async (productId: string) => {
    const input = fileInputRef.current;
    if (!input?.files?.length) return;
    handleUpload(productId);
  };

  const toggleProduct = (id: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const tabs = [
    { key: "products" as const, label: "Produtos", count: data?.products?.length || 0 },
    { key: "hero" as const, label: "Hero (Home)", count: data?.hero?.length || 0 },
    { key: "about" as const, label: "Sobre", count: data?.about?.length || 0 },
    { key: "categories" as const, label: "Categorias", count: data?.categories?.length || 0 },
  ];

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-zinc-800 rounded animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-zinc-100">Gerenciar Imagens</h1>
          <p className="text-zinc-400 text-sm mt-1">Upload, substituição e organização de fotos do site</p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Imagem
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={() => handleUpload()}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-800/50 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {activeTab === "products" && data && (
        <div className="space-y-4">
          {data.products.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">Nenhum produto com imagens cadastradas</div>
          ) : (
            data.products.map((group) => (
              <div key={group.productId} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleProduct(group.productId)}
                  className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {group.images[0] && (
                      <Image src={group.images[0].imageUrl} alt={group.productName} width={40} height={40} className="rounded object-cover" />
                    )}
                    <div className="text-left">
                      <span className="text-zinc-200 font-medium">{group.productName}</span>
                      <span className="text-zinc-500 text-xs ml-2">{group.images.length} foto(s)</span>
                    </div>
                  </div>
                  {expandedProducts.has(group.productId) ? <ChevronUp className="h-5 w-5 text-zinc-400" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
                </button>

                {expandedProducts.has(group.productId) && (
                  <div className="border-t border-zinc-800 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReplaceImage(group.productId)}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-1 text-xs"
                      >
                        <ImagePlus className="h-3 w-3" /> Adicionar foto
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {group.images
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((img) => (
                        <div key={img.id} className={`relative group rounded-lg overflow-hidden border-2 ${
                          img.isPrimary ? "border-amber-500" : "border-zinc-700 hover:border-zinc-600"
                        }`}>
                          <Image
                            src={img.imageUrl}
                            alt={img.altText || group.productName}
                            width={200}
                            height={200}
                            className="w-full aspect-square object-contain bg-zinc-950 p-2"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                            <button
                              onClick={() => handleSetPrimary(img.id, group.productId)}
                              className="p-1.5 bg-zinc-800/90 rounded hover:bg-zinc-700"
                              title={img.isPrimary ? "Principal" : "Tornar principal"}
                            >
                              {img.isPrimary ? <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> : <StarOff className="h-4 w-4 text-zinc-400" />}
                            </button>
                            <button
                              onClick={() => handleDelete(img.id)}
                              className="p-1.5 bg-zinc-800/90 rounded hover:bg-red-900/80"
                              title="Remover"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                          {img.isPrimary && (
                            <Badge className="absolute top-1 left-1 bg-amber-500 text-zinc-900 text-[10px] border-0">
                              Principal
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Static Images Tabs (hero, about, categories) */}
      {activeTab !== "products" && data && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const input = fileInputRef.current;
                if (!input?.files?.length) { fileInputRef.current?.click(); return; }
                handleUpload();
              }}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-1"
            >
              <ImagePlus className="h-3 w-3" /> Adicionar foto
            </Button>
            <span className="text-zinc-500 text-xs">
              Para trocar, faça upload com mesmo nome ou delete a antiga e faça upload da nova
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(activeTab === "hero" ? data.hero :
              activeTab === "about" ? data.about :
              data.categories).map((img, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden border border-zinc-700">
                <Image
                  src={img.imageUrl}
                  alt={img.filename}
                  width={300}
                  height={200}
                  className="w-full aspect-video object-cover bg-zinc-950"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleDelete(undefined, img.filename)}
                    className="p-1.5 bg-zinc-800/90 rounded hover:bg-red-900/80"
                    title="Remover"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
                <div className="p-2 bg-zinc-950">
                  <p className="text-zinc-400 text-xs truncate">{img.filename}</p>
                </div>
              </div>
            ))}
          </div>

          {(activeTab === "hero" && data.hero.length === 0 ||
            activeTab === "about" && data.about.length === 0 ||
            activeTab === "categories" && data.categories.length === 0) && (
            <div className="text-center py-20 text-zinc-500">Nenhuma imagem nesta seção</div>
          )}
        </div>
      )}

      <Separator className="bg-zinc-800" />
    </div>
  );
}
