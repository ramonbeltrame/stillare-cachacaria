"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Save,
  Loader2,
  ImagePlus,
  X,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slugify } from "@/lib/utils";
import toast from "react-hot-toast";

const productFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug obrigatório"),
  sku: z.string().min(1, "SKU obrigatório"),
  categoryId: z.string().min(1, "Categoria obrigatória"),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  price: z.coerce.number().positive("Preço deve ser positivo"),
  costPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0, "Estoque não pode ser negativo"),
  reorderLevel: z.coerce.number().int().min(0).default(10),
  ncm: z.string().default("2208.90.00"),
  cfop: z.string().default("5102"),
  volumeMl: z.coerce.number().int().positive().optional().or(z.literal("")),
  alcoholPercentage: z.coerce.number().positive().optional().or(z.literal("")),
  madeira: z.string().optional(),
  weightGrams: z.coerce.number().int().positive().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface Category {
  id: string;
  name: string;
}

interface ProductImage {
  id: string;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
}

interface ProductData {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    categoryId: string;
    description: string | null;
    longDescription: string | null;
    price: number;
    costPrice: number | null;
    stock: number;
    reorderLevel: number;
    ncm: string;
    cfop: string;
    volumeMl: number | null;
    alcoholPercentage: number | null;
    madeira: string | null;
    weightGrams: number | null;
    isActive: boolean;
    isFeatured: boolean;
    images: ProductImage[];
    category: Category;
  };
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;
  const [categories, setCategories] = useState<Category[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
  });

  const nameValue = watch("name");
  const isActive = watch("isActive");
  const isFeatured = watch("isFeatured");
  const categoryId = watch("categoryId");

  useEffect(() => {
    if (nameValue) {
      setValue("slug", slugify(nameValue));
    }
  }, [nameValue, setValue]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Produto não encontrado");
        return res.json();
      })
      .then((data: ProductData) => {
        const p = data.product;
        reset({
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          categoryId: p.categoryId,
          description: p.description || "",
          longDescription: p.longDescription || "",
          price: Number(p.price) || 0,
          costPrice: p.costPrice ? Number(p.costPrice) : (undefined as any),
          stock: p.stock,
          reorderLevel: p.reorderLevel,
          ncm: p.ncm,
          cfop: p.cfop,
          volumeMl: p.volumeMl || ("" as any),
          alcoholPercentage: p.alcoholPercentage
            ? Number(p.alcoholPercentage)
            : ("" as any),
          madeira: p.madeira || "",
          weightGrams: p.weightGrams || ("" as any),
          isActive: p.isActive,
          isFeatured: p.isFeatured,
        });
        setExistingImages(p.images || []);
      })
      .catch(() => {
        toast.error("Erro ao carregar produto");
        router.push("/admin/produtos");
      })
      .finally(() => setLoading(false));
  }, [productId, reset, router]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const totalImages = existingImages.length + newImages.length;
    const maxNew = 5 - totalImages;
    if (maxNew <= 0) {
      toast.error("Máximo de 5 imagens");
      return;
    }
    const toAdd = files.slice(0, maxNew);
    setNewImages((prev) => [...prev, ...toAdd]);
    const previews = toAdd.map((f) => URL.createObjectURL(f));
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeExistingImage = async (imageId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    toast.success("Imagem removida (salve para confirmar)");
  };

  const removeNewImage = (index: number) => {
    const updated = newImages.filter((_, i) => i !== index);
    setNewImages(updated);
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };

  const uploadNewImages = async (): Promise<{ imageUrl: string }[]> => {
    const urls: { imageUrl: string }[] = [];
    for (const file of newImages) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          urls.push({ imageUrl: data.url });
        }
      } catch {
        toast.error(`Erro ao fazer upload de ${file.name}`);
      }
    }
    return urls;
  };

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    try {
      const newImageUrls = await uploadNewImages();
      const allImageUrls = [
        ...existingImages.map((img) => ({ imageUrl: img.imageUrl })),
        ...newImageUrls,
      ];

      const productData: any = { ...data, id: productId };
      if (productData.volumeMl === "") delete productData.volumeMl;
      if (productData.alcoholPercentage === "") delete productData.alcoholPercentage;
      if (productData.madeira === "") productData.madeira = null;
      if (productData.weightGrams === "") delete productData.weightGrams;
      if (!productData.costPrice) delete productData.costPrice;

      const res = await fetch("/api/products/" + productId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao atualizar produto");
      }

      toast.success("Produto atualizado com sucesso!");
      router.push("/admin/produtos");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar produto");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao desativar produto");
      toast.success("Produto desativado com sucesso!");
      router.push("/admin/produtos");
    } catch {
      toast.error("Erro ao desativar produto");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl animate-pulse">
        <div className="h-8 w-48 bg-amber-500/5 rounded" />
        <div className="h-96 bg-amber-500/5 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-amber-100/60 hover:text-amber-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-amber-100">
              Editar Produto
            </h1>
            <p className="text-amber-100/40 text-sm mt-1">
              ID: {productId}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={() => setShowDeleteConfirm(true)}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Excluir
        </Button>
      </div>

      {showDeleteConfirm && (
        <Card className="bg-red-500/5 border-red-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-red-200 font-semibold">
                  Confirmar exclusão
                </h3>
                <p className="text-red-300/70 text-sm mt-1">
                  O produto será desativado e não aparecerá mais na loja. Os
                  dados não serão perdidos permanentemente.
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <Button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700 text-white gap-2"
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {deleting ? "Desativando..." : "Desativar Produto"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-amber-100/60 hover:text-amber-300"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="bg-[#120a04] border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-amber-100 text-lg">
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-amber-100/70">
                Categoria <span className="text-red-400">*</span>
              </Label>
              <Select
                value={categoryId}
                onValueChange={(v) => setValue("categoryId", v)}
              >
                <SelectTrigger className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-amber-100/70">Imagens do Produto</Label>
              <div className="mt-1.5 flex flex-wrap gap-3">
                {existingImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border border-amber-500/20"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.altText || ""}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-red-500/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {img.isPrimary && (
                      <span className="absolute bottom-0 left-0 right-0 bg-amber-500/80 text-black text-[9px] text-center font-semibold">
                        Principal
                      </span>
                    )}
                  </div>
                ))}
                {newImagePreviews.map((preview, i) => (
                  <div
                    key={`new-${i}`}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border border-amber-500/20"
                  >
                    <img
                      src={preview}
                      alt={`Nova ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-red-500/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {existingImages.length + newImages.length < 5 && (
                  <label className="w-24 h-24 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-colors">
                    <ImagePlus className="h-6 w-6 text-amber-100/30" />
                    <span className="text-[10px] text-amber-100/30">2MB max</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="name" className="text-amber-100/70">
                Nome <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Nome do produto"
                className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="slug" className="text-amber-100/70">
                Slug <span className="text-red-400">*</span>
              </Label>
              <Input
                id="slug"
                {...register("slug")}
                className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100 font-mono text-sm"
              />
              {errors.slug && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sku" className="text-amber-100/70">
                  SKU <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="sku"
                  {...register("sku")}
                  className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
                />
                {errors.sku && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.sku.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="volumeMl" className="text-amber-100/70">
                  Volume (ml)
                </Label>
                <Input
                  id="volumeMl"
                  {...register("volumeMl")}
                  type="number"
                  className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
                />
              </div>
              <div>
                <Label htmlFor="alcoholPercentage" className="text-amber-100/70">
                  Teor Alcoólico (%)
                </Label>
                <Input
                  id="alcoholPercentage"
                  {...register("alcoholPercentage")}
                  type="number"
                  step="0.1"
                  className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
                />
              </div>
            </div>

            <div>
              <Label className="text-amber-100/70">Madeira</Label>
              <Select
                value={watch("madeira") || ""}
                onValueChange={(v) => setValue("madeira", v)}
              >
                <SelectTrigger className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100">
                  <SelectValue placeholder="Selecione o tipo de madeira" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma (Prata/Branca)</SelectItem>
                  <SelectItem value="Carvalho Europeu">Carvalho Europeu</SelectItem>
                  <SelectItem value="Carvalho Americano (Ex-Bourbon)">Carvalho Americano (Ex-Bourbon)</SelectItem>
                  <SelectItem value="Carvalho Europeu + Amburana">Carvalho Europeu + Amburana</SelectItem>
                  <SelectItem value="Amburana">Amburana</SelectItem>
                  <SelectItem value="Jequitibá Rosa">Jequitibá Rosa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description" className="text-amber-100/70">
                Descrição Curta
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                rows={2}
                className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100 resize-none"
              />
            </div>

            <div>
              <Label htmlFor="longDescription" className="text-amber-100/70">
                Descrição Longa
              </Label>
              <Textarea
                id="longDescription"
                {...register("longDescription")}
                rows={4}
                className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#120a04] border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-amber-100 text-lg">
              Preço e Estoque
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-amber-100/70">
                  Preço (R$) <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="price"
                  {...register("price")}
                  type="number"
                  step="0.01"
                  className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
                />
                {errors.price && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="costPrice" className="text-amber-100/70">
                  Preço de Custo (R$)
                </Label>
                <Input
                  id="costPrice"
                  {...register("costPrice")}
                  type="number"
                  step="0.01"
                  className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock" className="text-amber-100/70">
                  Estoque <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="stock"
                  {...register("stock")}
                  type="number"
                  className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
                />
                {errors.stock && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.stock.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="reorderLevel" className="text-amber-100/70">
                  Estoque Mínimo
                </Label>
                <Input
                  id="reorderLevel"
                  {...register("reorderLevel")}
                  type="number"
                  className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="weightGrams" className="text-amber-100/70">
                Peso (gramas)
              </Label>
              <Input
                id="weightGrams"
                {...register("weightGrams")}
                type="number"
                className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100 max-w-xs"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#120a04] border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-amber-100 text-lg">
              Dados Fiscais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ncm" className="text-amber-100/70">
                  NCM
                </Label>
                <Input
                  id="ncm"
                  {...register("ncm")}
                  disabled
                  className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100/50"
                />
              </div>
              <div>
                <Label htmlFor="cfop" className="text-amber-100/70">
                  CFOP
                </Label>
                <Input
                  id="cfop"
                  {...register("cfop")}
                  disabled
                  className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#120a04] border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-amber-100 text-lg">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setValue("isActive", e.target.checked)}
                  className="w-4 h-4 rounded border-amber-500/30 bg-[#1a0f05] text-amber-500 focus:ring-amber-500/30"
                />
                <span className="text-amber-100/70 text-sm">Produto Ativo</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setValue("isFeatured", e.target.checked)}
                  className="w-4 h-4 rounded border-amber-500/30 bg-[#1a0f05] text-amber-500 focus:ring-amber-500/30"
                />
                <span className="text-amber-100/70 text-sm">
                  Produto em Destaque
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 pb-8">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-amber-500 hover:bg-amber-600 text-black font-medium gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {submitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="text-amber-100/60 hover:text-amber-300"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
